export function buildWalletMessage(hdyuId: string, nonce: string): string {
  return `HDYU Wallet Verification\n\nAccount: ${hdyuId}\nNonce: ${nonce}\n\nSign this message to link your wallet to your HDYU account. This does not cost any SOL.`;
}
