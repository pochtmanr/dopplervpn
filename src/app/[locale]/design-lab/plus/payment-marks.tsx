import { MastercardIcon, VisaIcon } from '@/components/icons/cards';
import { BtcIcon, EthIcon, UsdcIcon, UsdtIcon } from '@/components/icons/crypto';

/** What a Pro purchase takes: the two card networks, then the four coins. */
export function PaymentMarks() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="sr-only">Visa, Mastercard, BTC, ETH, USDT, USDC</span>
      <div className="flex items-center gap-1" aria-hidden="true">
        <VisaIcon width={30} height={19} />
        {/* White tile: a hairline so it keeps its edge on the light card. */}
        <MastercardIcon width={30} height={19} className="rounded-[3px] ring-1 ring-black/15" />
      </div>
      <span className="h-4 w-px bg-(--c-tert)/40" aria-hidden="true" />
      <div className="flex items-center gap-1.5" aria-hidden="true">
        <BtcIcon size={19} />
        <EthIcon size={19} />
        <UsdtIcon size={19} />
        <UsdcIcon size={19} />
      </div>
    </div>
  );
}
