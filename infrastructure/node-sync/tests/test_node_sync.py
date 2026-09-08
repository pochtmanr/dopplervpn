#!/usr/bin/env python3
"""Unit tests for doppler-node-sync's merge logic.

stdlib unittest only, same dependency rule as the agent itself.
Run:  python3 tests/test_node_sync.py

`tests/fake-node-config.json` is a realistic bare-xray node: six VLESS-REALITY
inbounds on 8443-8448 with real x25519 keypairs and shortIds, the api/dokodemo
inbound, sniffing, and `log.access = "none"`. It is validated by `xray -test`.

The tests that need the xray binary are skipped, loudly, when it is absent --
they never silently pass.
"""
import copy
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.dirname(HERE))

import node_sync as ns  # noqa: E402

FIXTURE = os.path.join(HERE, "fake-node-config.json")
XRAY = shutil.which(os.environ.get("XRAY_BIN", "xray"))

SHARED = "b7f3c2a1-4e5d-4a6b-9c8d-0e1f2a3b4c5d"   # legacy shared client: NO email, like the fleet


def U(uuid, account_id=None):
    """A desired-user row as the RPC layer hands it over."""
    return {"uuid": uuid, "account_id": account_id}


A1, A2, A3 = "acct_1001", "acct_1002", "acct_1003"
U1 = "11111111-2222-3333-4444-555555555555"
U2 = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"
U3 = "99999999-8888-7777-6666-555555555555"

PROXIES = [
    {"tag": "doppler-exit-us1", "protocol": "socks", "address": "203.0.113.10",
     "port": 1080, "user": "puser", "password": "ppass"},
    {"tag": "doppler-exit-hk1", "protocol": "socks", "address": "203.0.113.11",
     "port": 1080, "user": "puser2", "password": "ppass2"},
]
DOMAIN_SETS = [{"name": "flagged", "domains": ["domain:openai.com", "domain:chatgpt.com"]}]


def load():
    with open(FIXTURE, encoding="utf-8") as f:
        return json.load(f)


def uuids_on(cfg):
    """{inbound tag: [uuid, ...]} for every REALITY inbound."""
    return {ib["tag"]: [ns.client_uuid(c) for c in ib["settings"]["clients"]]
            for ib in ns.vless_inbounds(cfg)}


def xray_test(cfg):
    fd, path = tempfile.mkstemp(suffix=".json")
    with os.fdopen(fd, "w") as f:
        json.dump(cfg, f)
    try:
        p = subprocess.run([XRAY, "-test", "-config", path],
                           capture_output=True, text=True, timeout=30)
        return p.returncode == 0, p.stdout + p.stderr
    finally:
        os.unlink(path)


class TestFixture(unittest.TestCase):
    def test_fixture_shape(self):
        cfg = load()
        ibs = ns.vless_inbounds(cfg)
        self.assertEqual(len(ibs), 6, "fixture must have six REALITY inbounds")
        self.assertEqual([ib["port"] for ib in ibs], list(range(8443, 8449)))
        for ib in ibs:
            rs = ib["streamSettings"]["realitySettings"]
            self.assertTrue(rs["privateKey"])
            self.assertTrue(rs["shortIds"])
            self.assertTrue(rs["serverNames"])
        self.assertEqual(ns.access_log_value(cfg), "none")

    @unittest.skipIf(XRAY is None, "xray binary not installed -- config NOT validated")
    def test_fixture_is_valid_xray(self):
        ok, out = xray_test(load())
        self.assertTrue(ok, out)


class TestUserMerge(unittest.TestCase):
    def test_add_users(self):
        cfg = load()
        ns.merge_users(cfg, [U(SHARED), U(U1, A1), U(U2, A2)])
        for tag, us in uuids_on(cfg).items():
            self.assertEqual(us, [SHARED, U1, U2], tag)

    def test_new_client_email_is_the_account_id_never_the_uuid(self):
        cfg = load()
        ns.merge_users(cfg, [U(SHARED), U(U1, A1)])
        c = ns.vless_inbounds(cfg)[0]["settings"]["clients"][1]
        self.assertEqual(c["id"], U1)
        # The email becomes xray's stats key user>>>{email}>>>traffic>>>*, so it
        # must identify the ACCOUNT and must never carry the VLESS UUID, which
        # is a live credential.
        self.assertEqual(c["email"], f"{A1}@doppler")
        self.assertNotIn(U1, c["email"])
        self.assertEqual(c["flow"], "xtls-rprx-vision")

    def test_email_falls_back_to_a_hash_never_the_uuid(self):
        e = ns.user_email(U(U1))            # no account_id
        self.assertTrue(e.startswith("acct-"))
        self.assertTrue(e.endswith("@doppler"))
        self.assertNotIn(U1, e)

    def test_email_local_part_is_sanitised(self):
        self.assertEqual(ns.user_email(U(U1, "a b/c@d")), "a-b-c-d@doppler")

    def test_legacy_client_is_never_given_an_email(self):
        cfg = load()
        ns.merge_users(cfg, [U(SHARED), U(U1, A1)])
        shared = ns.vless_inbounds(cfg)[0]["settings"]["clients"][0]
        self.assertEqual(shared["id"], SHARED)
        self.assertNotIn("email", shared,
                         "the shared entry must stay emailless: adding one means "
                         "editing a REALITY inbound, which this agent will not do")

    def test_reissue_when_account_id_appears_later(self):
        cfg = load()
        ns.merge_users(cfg, [U(U1)])                      # hash fallback
        first = ns.vless_inbounds(cfg)[0]["settings"]["clients"][0]["email"]
        plan = ns.plan_users(copy.deepcopy(cfg), [U(U1, A1)])
        self.assertEqual(plan["vless-reality-8443"]["reissue"],
                         [(U1, first, f"{A1}@doppler")])
        ns.merge_users(cfg, [U(U1, A1)])
        self.assertEqual(ns.vless_inbounds(cfg)[0]["settings"]["clients"][0]["email"],
                         f"{A1}@doppler")

    def test_remove_users(self):
        cfg = load()
        ns.merge_users(cfg, [U(SHARED), U(U1, A1), U(U2, A2)])
        ns.merge_users(cfg, [U(SHARED), U(U2, A2)])
        for tag, us in uuids_on(cfg).items():
            self.assertEqual(us, [SHARED, U2], tag)

    def test_dropping_shared_uuid_is_possible_but_explicit(self):
        cfg = load()
        ns.merge_users(cfg, [U(U1, A1)])
        for tag, us in uuids_on(cfg).items():
            self.assertEqual(us, [U1], tag)

    def test_surviving_client_object_is_preserved_identically(self):
        cfg = load()
        cfg["inbounds"][1]["settings"]["clients"][0]["level"] = 7
        cfg["inbounds"][1]["settings"]["clients"][0]["custom"] = {"x": 1}
        before = copy.deepcopy(cfg["inbounds"][1]["settings"]["clients"][0])
        ns.merge_users(cfg, [U(SHARED), U(U1, A1)])
        self.assertEqual(cfg["inbounds"][1]["settings"]["clients"][0], before)

    def test_merge_is_idempotent(self):
        a, b = load(), load()
        ns.merge_users(a, [U(SHARED), U(U1, A1), U(U2, A2)])
        ns.merge_users(b, [U(SHARED), U(U1, A1), U(U2, A2)])
        ns.merge_users(b, [U(SHARED), U(U1, A1), U(U2, A2)])
        self.assertEqual(a, b)

    def test_plan_reports_adds_and_removes(self):
        cfg = load()
        ns.merge_users(cfg, [U(SHARED), U(U1, A1)])
        plan = ns.plan_users(copy.deepcopy(cfg), [U(SHARED), U(U2, A2)])
        for tag, p in plan.items():
            self.assertEqual(p["add"], [(U2, f"{A2}@doppler")], tag)
            self.assertEqual([u for u, _ in p["remove"]], [U1], tag)
            self.assertEqual(p["remove"][0][1], f"{A1}@doppler")

    def test_plan_flags_client_with_no_email_as_unrevokable(self):
        cfg = load()
        for ib in ns.vless_inbounds(cfg):
            ib["settings"]["clients"].append({"id": U3, "flow": "xtls-rprx-vision"})
        plan = ns.plan_users(cfg, [U(SHARED)])
        for tag, p in plan.items():
            self.assertIn((U3, None), p["remove"], tag)

    def test_reality_keys_never_change(self):
        orig = load()
        cfg = load()
        ns.merge_users(cfg, [U(U1, A1), U(U2, A2), U(U3, A3)])
        for a, b in zip(ns.vless_inbounds(orig), ns.vless_inbounds(cfg)):
            self.assertEqual(a["streamSettings"], b["streamSettings"])
            self.assertEqual(a["port"], b["port"])
            self.assertEqual(a["sniffing"], b["sniffing"])
        ns.assert_protected_unchanged(orig, cfg)

    @unittest.skipIf(XRAY is None, "xray binary not installed -- config NOT validated")
    def test_merged_config_is_valid_xray(self):
        cfg = load()
        ns.merge_users(cfg, [U(SHARED), U(U1, A1), U(U2, A2), U(U3, A3)])
        ok, out = xray_test(cfg)
        self.assertTrue(ok, out)


class TestLegacyClientProtection(unittest.TestCase):
    """The shared UUID must survive repeated runs. Regression: the original
    'first client of the first inbound' heuristic identified the wrong client
    on run 2 and would have revoked the whole legacy customer base."""

    def test_shared_client_is_legacy_managed_ones_are_not(self):
        cfg = load()
        self.assertEqual(ns.legacy_uuids(ns.vless_inbounds(cfg)), [SHARED])
        ns.merge_users(cfg, [U(SHARED), U(U1, A1), U(U2, A2)])
        self.assertEqual(ns.legacy_uuids(ns.vless_inbounds(cfg)), [SHARED],
                         "after a merge the shared client must STILL be the only legacy one")

    def test_shared_uuid_survives_repeated_reconciliations(self):
        """Four ticks in a row, exactly as the timer would run them."""
        cfg = load()
        supabase = [U(U1, A1), U(U2, A2)]
        for _ in range(4):
            have = {x["uuid"] for x in supabase}
            keep = [U(u) for u in ns.legacy_uuids(ns.vless_inbounds(cfg)) if u not in have]
            ns.merge_users(cfg, supabase + keep)
            self.assertIn(SHARED, uuids_on(cfg)["vless-reality-8443"],
                          "the shared UUID was silently dropped")

    def test_hand_added_client_is_also_protected(self):
        cfg = load()
        for ib in ns.vless_inbounds(cfg):
            ib["settings"]["clients"].append({"id": U3, "email": "ops-laptop@corp.example"})
        self.assertEqual(ns.legacy_uuids(ns.vless_inbounds(cfg)), [SHARED, U3])

    def test_managed_detection_is_by_email_domain_not_local_part(self):
        # Local part may change (hash fallback -> real account id) without the
        # client being reclassified as legacy and protected forever.
        self.assertTrue(ns.is_managed_client({"id": U1, "email": f"{A1}@doppler"}))
        self.assertTrue(ns.is_managed_client({"id": U1, "email": "acct-deadbeef@doppler"}))
        self.assertFalse(ns.is_managed_client({"id": SHARED}))
        self.assertFalse(ns.is_managed_client({"id": U1, "email": "someone@corp.example"}))


class TestZeroProxies(unittest.TestCase):
    """The WS6 acceptance criterion: no proxies => the fleet is unaffected."""

    def test_zero_proxies_is_a_no_op_on_the_object(self):
        orig = load()
        cfg = load()
        ns.render_proxies(cfg, [], [])
        self.assertEqual(cfg, orig, "zero proxies must not alter the config at all")

    def test_zero_proxies_leaves_file_bytes_identical(self):
        """The real guarantee: main() skips the write when nothing changed."""
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, "config.json")
            shutil.copy2(FIXTURE, path)
            def sha():
                with open(path, "rb") as f:
                    return hashlib.sha256(f.read()).hexdigest()
            before_sha = sha()
            before_mtime = os.stat(path).st_mtime_ns

            raw, orig = ns.load_config(path)
            new = copy.deepcopy(orig)
            ns.render_proxies(new, [], [])
            changed = new != orig
            self.assertFalse(changed)
            if changed:                      # the branch main() would take
                ns.write_config(path, new, False)

            self.assertEqual(sha(), before_sha)
            self.assertEqual(os.stat(path).st_mtime_ns, before_mtime)

    def test_zero_proxies_after_proxies_returns_to_baseline(self):
        orig = load()
        cfg = load()
        ns.render_proxies(cfg, PROXIES, DOMAIN_SETS)
        self.assertNotEqual(cfg, orig)
        ns.render_proxies(cfg, [], [])
        self.assertEqual(cfg, orig, "removing the last proxy must restore the baseline")

    def test_user_sync_alone_touches_no_routing(self):
        orig = load()
        cfg = load()
        ns.merge_users(cfg, [U(SHARED), U(U1, A1)])
        ns.render_proxies(cfg, [], [])
        self.assertEqual(cfg["routing"], orig["routing"])
        self.assertEqual(cfg["outbounds"], orig["outbounds"])
        self.assertNotIn("observatory", cfg)


class TestProxyRender(unittest.TestCase):
    def test_outbounds_appended_in_priority_order(self):
        cfg = load()
        n_before = len(cfg["outbounds"])
        ns.render_proxies(cfg, PROXIES, DOMAIN_SETS)
        tags = [o["tag"] for o in cfg["outbounds"]]
        self.assertEqual(tags[:n_before], ["direct", "blocked"],
                         "outbounds[0] is xray's default route; it must not move")
        self.assertEqual(tags[n_before:], ["doppler-exit-us1", "doppler-exit-hk1"])

    def test_balancer_and_observatory(self):
        cfg = load()
        ns.render_proxies(cfg, PROXIES, DOMAIN_SETS)
        bal = cfg["routing"]["balancers"][0]
        self.assertEqual(bal["tag"], ns.BALANCER_TAG)
        self.assertEqual(bal["selector"], [ns.MANAGED_PREFIX])
        self.assertEqual(bal["strategy"]["type"], "roundRobin")
        self.assertEqual(bal["fallbackTag"], "direct")
        self.assertEqual(cfg["observatory"]["subjectSelector"], [ns.MANAGED_PREFIX])

    def test_rules_go_after_the_blocks_and_before_the_catch_all(self):
        orig = load()
        cfg = load()
        ns.render_proxies(cfg, PROXIES, DOMAIN_SETS)
        rules = cfg["routing"]["rules"]
        tags = [r.get("ruleTag") or r.get("outboundTag") for r in rules]
        # fixture rules: api -> blocked(bittorrent) -> direct(catch-all)
        self.assertEqual(tags, ["api", "blocked", "doppler-exit-flagged", "direct"])
        self.assertEqual([r for r in rules if r.get("ruleTag") != "doppler-exit-flagged"],
                         orig["routing"]["rules"],
                         "existing rules must survive unchanged and in order")

    def test_rules_never_jump_ahead_of_the_baseline_security_blocks(self):
        """Regression guard against ../xray/node-baseline.json's rule order.

        A naive prepend would put the domain rule ahead of `block-private`,
        losing the only in-xray defence against DNS rebinding.
        """
        cfg = load()
        cfg["outbounds"] = [{"tag": "direct", "protocol": "freedom"},
                            {"tag": "block", "protocol": "blackhole"}]
        cfg["routing"] = {"domainStrategy": "IPIfNonMatch", "rules": [
            {"ruleTag": "api-inbound", "inboundTag": ["api"], "outboundTag": "api"},
            {"ruleTag": "block-private", "ip": ["169.254.0.0/16"], "outboundTag": "block"},
            {"ruleTag": "block-bittorrent", "protocol": ["bittorrent"], "outboundTag": "block"},
            {"ruleTag": "block-smtp", "port": 25, "outboundTag": "block"}]}
        ns.render_proxies(cfg, PROXIES, DOMAIN_SETS)
        tags = [r["ruleTag"] for r in cfg["routing"]["rules"]]
        self.assertEqual(tags, ["api-inbound", "block-private", "block-bittorrent",
                                "block-smtp", "doppler-exit-flagged"])

    def test_blackhole_detected_by_protocol_not_tag_name(self):
        cfg = load()
        cfg["outbounds"] = [{"tag": "direct", "protocol": "freedom"},
                            {"tag": "sinkhole", "protocol": "blackhole"}]
        cfg["routing"]["rules"] = [{"ruleTag": "b", "outboundTag": "sinkhole"},
                                   {"ruleTag": "catchall", "outboundTag": "direct"}]
        ns.render_proxies(cfg, PROXIES, DOMAIN_SETS)
        self.assertEqual([r["ruleTag"] for r in cfg["routing"]["rules"]],
                         ["b", "doppler-exit-flagged", "catchall"])

    def test_render_is_idempotent(self):
        a, b = load(), load()
        ns.render_proxies(a, PROXIES, DOMAIN_SETS)
        ns.render_proxies(b, PROXIES, DOMAIN_SETS)
        ns.render_proxies(b, PROXIES, DOMAIN_SETS)
        self.assertEqual(a, b, "re-running must not stack duplicate outbounds/rules")

    def test_protected_projection_accepts_proxy_render(self):
        orig = load()
        cfg = load()
        ns.render_proxies(cfg, PROXIES, DOMAIN_SETS)
        ns.assert_protected_unchanged(orig, cfg)

    def test_credentials_are_redacted_in_printed_output(self):
        cfg = load()
        ns.render_proxies(cfg, PROXIES, DOMAIN_SETS)
        text = json.dumps(ns.redact(cfg))
        self.assertNotIn("ppass", text)
        self.assertNotIn("puser", text)
        for ib in ns.vless_inbounds(load()):
            self.assertNotIn(ib["streamSettings"]["realitySettings"]["privateKey"], text)

    def test_secret_scrubbing_in_log_lines(self):
        ns.remember_secret("hunter2supersecret")
        self.assertNotIn("hunter2supersecret", ns.scrub("proxy failed: hunter2supersecret"))

    @unittest.skipIf(XRAY is None, "xray binary not installed -- config NOT validated")
    def test_rendered_config_is_valid_xray(self):
        cfg = load()
        ns.merge_users(cfg, [U(SHARED), U(U1, A1), U(U2, A2)])
        ns.render_proxies(cfg, PROXIES, DOMAIN_SETS)
        ok, out = xray_test(cfg)
        self.assertTrue(ok, out)


class TestParsers(unittest.TestCase):
    def test_authorized_users_accepts_every_plausible_shape(self):
        want = [U(U1), U(U2)]
        for payload in (
            [U1, U2],
            [{"vless_uuid": U1}, {"vless_uuid": U2}],
            [{"uuid": U1}, {"uuid": U2}],
            {"users": [U1, U2]},
            [{"users": [{"id": U1}, {"id": U2}]}],
        ):
            self.assertEqual(ns.parse_authorized_users(payload), want, repr(payload))

    def test_authorized_users_carries_account_id_through(self):
        for payload in ([{"vless_uuid": U1, "account_id": A1}],
                        [{"uuid": U1, "account": A1}],
                        [{"id": U1, "acct": A1}]):
            self.assertEqual(ns.parse_authorized_users(payload), [U(U1, A1)], repr(payload))

    def test_single_user_response_is_not_mistaken_for_a_wrapper(self):
        """Regression: `[{"vless_uuid": ...}]` is one user, not a wrapper object."""
        self.assertEqual(ns.parse_authorized_users([{"vless_uuid": U1, "account_id": A1}]),
                         [U(U1, A1)])

    def test_authorized_users_dedups_on_uuid(self):
        self.assertEqual(ns.parse_authorized_users([{"uuid": U1, "account_id": A1},
                                                    {"uuid": U1, "account_id": A2}]),
                         [U(U1, A1)])

    def test_authorized_users_rejects_a_non_uuid(self):
        with self.assertRaises(ns.Abort):
            ns.parse_authorized_users(["not-a-uuid"])

    def test_authorized_users_error_never_leaks_the_value(self):
        try:
            ns.parse_authorized_users(["s3cret-leaked-token"])
        except ns.Abort as e:
            self.assertNotIn("s3cret", str(e))

    def test_authorized_users_none_is_empty(self):
        # Asymmetric on purpose: no proxies is normal, no users is a broken RPC.
        self.assertEqual(ns.parse_authorized_users(None), [])

    def test_exit_proxies_empty(self):
        self.assertEqual(ns.parse_exit_proxies({"proxies": [], "domain_sets": []}), ([], []))
        self.assertEqual(ns.parse_exit_proxies([]), ([], []))
        self.assertEqual(ns.parse_exit_proxies(None), ([], []))

    def test_exit_proxies_sorted_by_priority_and_tag_namespaced(self):
        p, d = ns.parse_exit_proxies({"proxies": [
            {"priority": 2, "tag": "hk1", "address": "1.1.1.1", "port": 1080},
            {"priority": 1, "tag": "us1", "address": "2.2.2.2", "port": 1080},
        ], "domain_sets": [{"name": "Flagged Set", "domains": ["domain:openai.com"]}]})
        self.assertEqual([x["tag"] for x in p], ["doppler-exit-us1", "doppler-exit-hk1"])
        self.assertEqual(d[0]["name"], "flagged-set")

    def test_exit_proxies_rejects_bad_rows(self):
        for bad in ({"proxies": [{"address": "1.1.1.1", "port": "nope"}]},
                    {"proxies": [{"address": "", "port": 1080}]},
                    {"proxies": [{"address": "1.1.1.1", "port": 1080, "protocol": "wireguard"}]}):
            with self.assertRaises(ns.Abort, msg=repr(bad)):
                ns.parse_exit_proxies(bad)

    def test_exit_proxy_password_is_registered_as_a_secret(self):
        ns.parse_exit_proxies({"proxies": [
            {"address": "1.1.1.1", "port": 1080, "password": "leakme-abcdef"}]})
        self.assertNotIn("leakme-abcdef", ns.scrub("upstream said: leakme-abcdef"))


class TestAbortSafety(unittest.TestCase):
    def test_aborted_merge_leaves_the_original_file_untouched(self):
        """xray -test rejects the candidate => the file on disk must not move."""
        if XRAY is None:
            self.skipTest("xray binary not installed -- write path NOT validated")
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, "config.json")
            shutil.copy2(FIXTURE, path)
            with open(path, "rb") as f:
                before = f.read()
            backups = os.path.join(d, "backups")
            old_dir, ns.BACKUP_DIR = ns.BACKUP_DIR, backups
            try:
                _, cfg = ns.load_config(path)
                cfg["routing"]["balancers"] = [
                    {"tag": "b", "selector": ["x"], "strategy": {"type": "bogusStrategy"}}]
                with self.assertRaises(ns.Abort):
                    ns.write_config(path, cfg, False)
            finally:
                ns.BACKUP_DIR = old_dir
            with open(path, "rb") as f:
                after = f.read()
            self.assertEqual(after, before,
                             "a rejected candidate must never reach the live path")
            self.assertFalse([n for n in os.listdir(d) if n.startswith(".node-sync.")],
                             "the temp candidate must be cleaned up")

    def test_protected_change_aborts(self):
        cfg = load()
        cfg["inbounds"][1]["streamSettings"]["realitySettings"]["shortIds"] = ["deadbeef"]
        with self.assertRaises(ns.Abort) as cm:
            ns.assert_protected_unchanged(load(), cfg)
        self.assertIn("not surgical", str(cm.exception))

    def test_protected_change_to_a_foreign_outbound_aborts(self):
        cfg = load()
        cfg["outbounds"][0]["protocol"] = "blackhole"
        with self.assertRaises(ns.Abort):
            ns.assert_protected_unchanged(load(), cfg)

    def test_dropping_a_foreign_routing_rule_aborts(self):
        cfg = load()
        del cfg["routing"]["rules"][1]
        with self.assertRaises(ns.Abort):
            ns.assert_protected_unchanged(load(), cfg)

    def test_access_log_assertion(self):
        cfg = load()
        cfg["log"]["access"] = "/var/log/xray/access.log"
        with self.assertRaises(ns.Abort):
            ns.assert_access_log_none(cfg)
        del cfg["log"]["access"]
        with self.assertRaises(ns.Abort):
            ns.assert_access_log_none(cfg)   # unset means stdout, NOT off

    def test_enforce_access_log_normalises_an_unset_key(self):
        cfg = load()
        del cfg["log"]["access"]
        self.assertTrue(ns.enforce_access_log(cfg))
        ns.assert_access_log_none(cfg)

    def test_write_refuses_credentials_into_a_world_readable_config(self):
        with tempfile.TemporaryDirectory() as d:
            path = os.path.join(d, "config.json")
            shutil.copy2(FIXTURE, path)
            os.chmod(path, 0o644)
            _, cfg = ns.load_config(path)
            with self.assertRaises(ns.Abort) as cm:
                ns.write_config(path, cfg, True)
            self.assertIn("world", str(cm.exception).lower() + "world")
            self.assertIn("credentials", str(cm.exception))

    def test_no_reality_inbounds_is_caught(self):
        cfg = {"log": {"access": "none"}, "inbounds": [], "outbounds": []}
        self.assertEqual(ns.vless_inbounds(cfg), [])

    def test_untagged_reality_inbound_aborts(self):
        cfg = load()
        del cfg["inbounds"][1]["tag"]
        with self.assertRaises(ns.Abort):
            ns.vless_inbounds(cfg)


class TestLiveDiff(unittest.TestCase):
    """apply_live against a stubbed xray API."""

    def setUp(self):
        self.saved = (ns.api_precondition, ns.live_users, ns.live_add, ns.live_remove)
        self.added, self.removed = [], []
        ns.api_precondition = lambda cfg: (True, "")
        ns.live_add = lambda specs: (self._add(specs), "")
        ns.live_remove = lambda tag, emails: (self._rm(tag, emails), "")

    def tearDown(self):
        (ns.api_precondition, ns.live_users, ns.live_add, ns.live_remove) = self.saved

    def _add(self, specs):
        n = 0
        for s in specs:
            for c in s["clients"]:
                self.added.append((s["tag"], c.get("email")))
                n += 1
        return n

    def _rm(self, tag, emails):
        self.removed += [(tag, e) for e in emails]
        return len(emails)

    def test_emailless_client_is_never_sent_to_the_api(self):
        """Verified on xray 26.3.27: `adu` silently reports 'Added 0 user(s)'
        for an emailless client and `inbounduser` never lists it. Sending it
        would make every tick report a phantom failure forever."""
        cfg = load()
        ns.merge_users(cfg, [{"uuid": SHARED, "account_id": None},
                             {"uuid": U1, "account_id": A1}])
        ns.live_users = lambda tag: (True, {})          # nothing live yet
        self.assertTrue(ns.apply_live(cfg, [{"uuid": SHARED, "account_id": None},
                                            {"uuid": U1, "account_id": A1}]))
        self.assertEqual(sorted({e for _, e in self.added}), [f"{A1}@doppler"])
        self.assertEqual(len(self.added), 6, "one add per inbound, shared excluded")

    def test_revocation_removes_by_email(self):
        cfg = load()
        ns.merge_users(cfg, [{"uuid": U1, "account_id": A1}])
        ns.live_users = lambda tag: (True, {U1: f"{A1}@doppler", U2: f"{A2}@doppler"})
        self.assertTrue(ns.apply_live(cfg, [{"uuid": U1, "account_id": A1}]))
        self.assertEqual(sorted({e for _, e in self.removed}), [f"{A2}@doppler"])
        self.assertEqual(self.added, [])

    def test_reissue_removes_old_email_then_adds_new(self):
        cfg = load()
        ns.merge_users(cfg, [{"uuid": U1, "account_id": A1}])
        ns.live_users = lambda tag: (True, {U1: "acct-oldhash@doppler"})
        self.assertTrue(ns.apply_live(cfg, [{"uuid": U1, "account_id": A1}]))
        self.assertEqual(sorted({e for _, e in self.removed}), ["acct-oldhash@doppler"])
        self.assertEqual(sorted({e for _, e in self.added}), [f"{A1}@doppler"])

    def test_precondition_failure_skips_the_live_step(self):
        ns.api_precondition = lambda cfg: (False, "no api block")
        self.assertFalse(ns.apply_live(load(), [{"uuid": U1, "account_id": A1}]))
        self.assertEqual(self.added, [])


class TestPrecondition(unittest.TestCase):
    def test_missing_api_block_is_named_explicitly(self):
        cfg = load()
        del cfg["api"]
        ok, why = ns.api_precondition(cfg)
        self.assertFalse(ok)
        self.assertIn("no `api` block", why)
        self.assertIn("apply-node-baseline.sh", why)

    def test_api_block_without_handlerservice_is_named(self):
        cfg = load()
        cfg["api"]["services"] = ["StatsService"]
        ok, why = ns.api_precondition(cfg)
        self.assertFalse(ok)
        self.assertIn("HandlerService", why)

    def test_baseline_services_list_is_accepted(self):
        # node-baseline.json ships HandlerService, StatsService, LoggerService
        cfg = load()
        cfg["api"]["services"] = ["HandlerService", "StatsService", "LoggerService"]
        saved, ns.api_reachable = ns.api_reachable, lambda: True
        try:
            self.assertEqual(ns.api_precondition(cfg), (True, ""))
        finally:
            ns.api_reachable = saved


class TestTrailerParsing(unittest.TestCase):
    """adu/rmu exit 0 even on failure; only the trailer line is trustworthy."""

    def test_success_trailer(self):
        self.assertEqual(ns._trailer_count(
            "processing inbound: x\nadd user: a\nresult: ok\nAdded 1 user(s) in total."), 1)

    def test_failure_trailer_is_zero_not_none(self):
        self.assertEqual(ns._trailer_count(
            "add user: a\nrpc error: code = Unknown desc = proxy/vless: User a already "
            "exists.\nAdded 0 user(s) in total."), 0)

    def test_removed_trailer(self):
        self.assertEqual(ns._trailer_count(
            "remove user: a\nRemoved 6 user(s) in total."), 6)

    def test_no_trailer_at_all_is_none(self):
        self.assertIsNone(ns._trailer_count("connection refused"))


if __name__ == "__main__":
    if XRAY is None:
        print("!! xray binary NOT found: config-validity tests will be SKIPPED, "
              "not passed.\n", file=sys.stderr)
    else:
        print(f"xray found at {XRAY}\n", file=sys.stderr)
    unittest.main(verbosity=2)
