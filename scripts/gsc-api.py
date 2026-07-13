#!/usr/bin/env python3
"""Minimal Google Search Console API client (stdlib + openssl only).

Auth: service-account JWT (RS256 via `openssl dgst`), exchanged for an
OAuth2 access token. Key file lives in .secrets/gsc-service-account.json
(gitignored — never commit it).

Usage:
  python3 scripts/gsc-api.py sites
  python3 scripts/gsc-api.py sitemaps <siteUrl>
  python3 scripts/gsc-api.py query <siteUrl> <days> [dimensions]   # searchanalytics
  python3 scripts/gsc-api.py raw <method> <path> [json-body-file]  # arbitrary call

<siteUrl> examples: sc-domain:dopplervpn.org  or  https://www.dopplervpn.org/
"""
import base64, json, subprocess, sys, tempfile, time, urllib.parse, urllib.request
from datetime import date, timedelta
from pathlib import Path

KEY_FILE = Path(__file__).resolve().parent.parent / ".secrets" / "gsc-service-account.json"
SCOPE = "https://www.googleapis.com/auth/webmasters.readonly"
API = "https://www.googleapis.com/webmasters/v3"


def b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def get_token() -> str:
    sa = json.loads(KEY_FILE.read_text())
    now = int(time.time())
    header = b64url(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    claims = b64url(json.dumps({
        "iss": sa["client_email"], "scope": SCOPE,
        "aud": "https://oauth2.googleapis.com/token",
        "iat": now, "exp": now + 3600,
    }).encode())
    signing_input = f"{header}.{claims}".encode()
    with tempfile.NamedTemporaryFile("w", suffix=".pem") as kf:
        kf.write(sa["private_key"])
        kf.flush()
        sig = subprocess.run(
            ["openssl", "dgst", "-sha256", "-sign", kf.name],
            input=signing_input, capture_output=True, check=True,
        ).stdout
    jwt = f"{header}.{claims}.{b64url(sig)}"
    body = urllib.parse.urlencode({
        "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
        "assertion": jwt,
    }).encode()
    req = urllib.request.Request("https://oauth2.googleapis.com/token", data=body)
    with urllib.request.urlopen(req) as r:
        return json.load(r)["access_token"]


def call(method, path, body=None):
    req = urllib.request.Request(
        API + path,
        data=json.dumps(body).encode() if body is not None else None,
        method=method,
        headers={"Authorization": f"Bearer {get_token()}",
                 "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            raw = r.read()
            return json.loads(raw) if raw else {}
    except urllib.error.HTTPError as e:
        print(f"HTTP {e.code}: {e.read().decode()}", file=sys.stderr)
        sys.exit(1)


def main() -> None:
    cmd = sys.argv[1] if len(sys.argv) > 1 else "sites"
    if cmd == "sites":
        out = call("GET", "/sites")
    elif cmd == "sitemaps":
        site = urllib.parse.quote(sys.argv[2], safe="")
        out = call("GET", f"/sites/{site}/sitemaps")
    elif cmd == "query":
        site = urllib.parse.quote(sys.argv[2], safe="")
        days = int(sys.argv[3]) if len(sys.argv) > 3 else 90
        dims = (sys.argv[4].split(",") if len(sys.argv) > 4 else ["query"])
        end = date.today() - timedelta(days=2)  # GSC data lags ~2 days
        out = call("POST", f"/sites/{site}/searchAnalytics/query", {
            "startDate": str(end - timedelta(days=days)),
            "endDate": str(end),
            "dimensions": dims,
            "rowLimit": 25000,
        })
    elif cmd == "raw":
        body = json.loads(Path(sys.argv[4]).read_text()) if len(sys.argv) > 4 else None
        out = call(sys.argv[2].upper(), sys.argv[3], body)
    else:
        sys.exit(__doc__)
    json.dump(out, sys.stdout, indent=1)


if __name__ == "__main__":
    main()
