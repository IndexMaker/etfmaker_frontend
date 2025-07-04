import { v4 as uuidv4 } from 'uuid';

export interface FixHeader {
  msg_type: string;
  sender_comp_id: string;
  target_comp_id: string;
  seq_num: number;
  timestamp: string;
}

export interface FixTrailer {
  public_key: string[];
  signature: string[];
}

export interface FixRequestBase {
  standard_header: FixHeader;
  chain_id: number;
  address: string;
  standard_trailer: FixTrailer;
}

export function createHeader(msgType: string, seqNum: number): FixHeader {
  return {
    msg_type: msgType,
    sender_comp_id: 'FrontendClient',
    target_comp_id: 'IndexMakerServer',
    seq_num: seqNum,
    timestamp: new Date().toISOString(),
  };
}

export function createTrailer(): FixTrailer {
  return {
    public_key: ['FrontendMockPubKey'],
    signature: ['MockSignature'],
  };
}

export function buildNewQuoteRequest({
  chainId,
  address,
  symbol,
  side,
  amount,
  seqNum,
}: {
  chainId: number;
  address: string;
  symbol: string;
  side: string;
  amount: string;
  seqNum: number;
}) {
  const client_quote_id = `Q-${uuidv4()}`;

  return {
    standard_header: createHeader('NewQuoteRequest', seqNum),
    chain_id: chainId,
    address,
    client_quote_id,
    symbol,
    side,
    amount,
    standard_trailer: createTrailer(),
  };
}
