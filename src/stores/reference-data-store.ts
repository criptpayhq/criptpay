import { create } from "zustand";
import api from "@/lib/api";

interface Bank {
  code: string;
  name: string;
  icon: string;
}

interface Currency {
  id?: string;
  symbol: string;
  name: string;
  icon: string;
  network?: string;
  network_icon?: string;
  address?: string;
}

interface Network {
  name: string;
  description: string;
  icon?: string;
}

const NETWORK_ICONS: Record<string, string> = {
  Base: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/base/info/logo.png",
  Ethereum: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png",
  Solana: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png",
  Polygon: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
  BSC: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png",
  "BNB Chain": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png",
  Arbitrum: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/arbitrum/info/logo.png",
  Optimism: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/optimism/info/logo.png",
  Tron: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/info/logo.png",
  Avalanche: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/avalanche/info/logo.png",
  Monad: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/monad/info/logo.png",
  Gnosis: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/xdai/info/logo.png",
  Plasma: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png",
};

const TOKEN_ICONS: Record<string, string> = {
  USDC: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  USDT: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
};

// Reference data barely changes — 30 min is a safe default staleness window.
// Bump this up (or down) if your banks/tokens change more/less often.
const STALE_MS = 30 * 60 * 1000;

interface ReferenceDataState {
  banks: Bank[];
  tokens: Currency[];
  networks: Network[];
  fiatList: Currency[];

  loadingBanks: boolean;
  loadingTokens: boolean;
  loadingFiat: boolean;

  banksFetchedAt: number | null;
  tokensFetchedAt: number | null;
  fiatFetchedAt: number | null;

  fetchBanks: (force?: boolean) => Promise<void>;
  fetchTokens: (force?: boolean) => Promise<void>;
  fetchFiat: (force?: boolean) => Promise<void>;
}

export const useReferenceDataStore = create<ReferenceDataState>((set, get) => ({
  banks: [],
  tokens: [],
  networks: [],
  fiatList: [],

  loadingBanks: false,
  loadingTokens: false,
  loadingFiat: false,

  banksFetchedAt: null,
  tokensFetchedAt: null,
  fiatFetchedAt: null,

  fetchBanks: async (force = false) => {
    const { banksFetchedAt, loadingBanks } = get();
    if (loadingBanks) return;
    if (!force && banksFetchedAt && Date.now() - banksFetchedAt < STALE_MS) return;

    set({ loadingBanks: true });
    try {
      const response = await api.get("/banks");
      const mappedBanks: Bank[] = response.data.map((b: any) => ({
        code: b.code,
        name: b.name,
        icon: b.icon || "",
      }));
      set({ banks: mappedBanks, banksFetchedAt: Date.now() });
    } catch (error) {
      console.error("Failed to fetch banks", error);
      throw error;
    } finally {
      set({ loadingBanks: false });
    }
  },

  fetchTokens: async (force = false) => {
    const { tokensFetchedAt, loadingTokens } = get();
    if (loadingTokens) return;
    if (!force && tokensFetchedAt && Date.now() - tokensFetchedAt < STALE_MS) return;

    set({ loadingTokens: true });
    try {
      const response = await api.get("/tokens");
      const mappedTokens: Currency[] = response.data.map((t: any) => ({
        id: String(t.id || ""),
        symbol: String(t.symbol || t.code || ""),
        name: String(t.name || ""),
        icon: String(t.icon || TOKEN_ICONS[String(t.symbol || t.code || "")] || ""),
        network: String(t.network || t.blockchain || ""),
        network_icon: String(
          t.network_icon || NETWORK_ICONS[String(t.network || t.blockchain || "")] || ""
        ),
        address: String(t.address || ""),
      }));

      const networkMap = new Map<string, string>();
      mappedTokens.forEach((t) => {
        if (t.network && !networkMap.has(t.network)) {
          networkMap.set(t.network, t.network_icon || "");
        }
      });

      const uniqueNetworks: Network[] = Array.from(networkMap.keys())
        .sort()
        .map((name) => ({
          name,
          description: `${name} network`,
          icon: networkMap.get(name),
        }));

      const baseNetwork = uniqueNetworks.find((n) => n.name.toLowerCase() === "base");
      const otherNetworks = uniqueNetworks.filter((n) => n.name.toLowerCase() !== "base");
      const orderedNetworks = baseNetwork ? [baseNetwork, ...otherNetworks] : uniqueNetworks;

      set({ tokens: mappedTokens, networks: orderedNetworks, tokensFetchedAt: Date.now() });
    } catch (error) {
      console.error("Failed to fetch tokens", error);
      throw error;
    } finally {
      set({ loadingTokens: false });
    }
  },

  fetchFiat: async (force = false) => {
    const { fiatFetchedAt, loadingFiat } = get();
    if (loadingFiat) return;
    if (!force && fiatFetchedAt && Date.now() - fiatFetchedAt < STALE_MS) return;

    set({ loadingFiat: true });
    try {
      const response = await api.get("/fiat");
      const mappedFiat: Currency[] = response.data.map((c: any) => ({
        symbol: String(c.code || ""),
        name: String(c.name || ""),
        icon: String(c.icon || ""),
      }));
      set({ fiatList: mappedFiat, fiatFetchedAt: Date.now() });
    } catch (error) {
      console.error("Failed to fetch currencies", error);
      throw error;
    } finally {
      set({ loadingFiat: false });
    }
  },
}));