export interface NansenLabel {
  label: string;
  category: string;
}

export interface NansenApiAddress {
  address: string;
  entity: string | null;
  labels: NansenLabel[];
  smartMoney: boolean;
  txCount: number | null;
}

export interface WalletIntelligence {
  address: string;
  entityName: string | null;
  labels: NansenLabel[];
  isSmartMoney: boolean;
  isExchange: boolean;
  isFund: boolean;
  isHacker: boolean;
  transactionCount: number | null;
}
