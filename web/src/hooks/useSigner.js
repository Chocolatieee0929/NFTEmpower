import { useEffect, useState } from "react";
import { ethers} from 'ethers'

export default function useSigner(walletProvider) {
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    if (!walletProvider) return;
    const provider = new ethers.providers.Web3Provider(walletProvider);
    setSigner(provider.getSigner())
  }, [walletProvider])
  return signer;
}
