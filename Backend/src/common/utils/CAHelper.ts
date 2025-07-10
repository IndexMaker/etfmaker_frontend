import {
  keccak256,
  toHex,
  parseAbiParameters,
  encodeAbiParameters,
  concat,
  pad,
  Address,
  Hex,
  ByteArray,
  hexToBytes,
} from 'viem';
import { StandardMerkleTree } from '@openzeppelin/merkle-tree';

// Define types for the CA items
type CAItemType =
  | 'deployConnector'
  | 'callConnector'
  | 'custodyToAddress'
  | 'custodyToConnector'
  | 'changeCustodyState'
  | 'custodyToCustody'
  | 'updateCA'
  | 'updateCustodyState';

interface Party {
  parity: number;
  x: Hex;
}

interface CAItemExpanded {
  type: CAItemType;
  chainId: number;
  otcCustody: Address;
  state: number;
  args: Hex;
  party: Party | Party[];
}

class CAHelper {
  private caItems: CAItemExpanded[];
  private merkleTree: StandardMerkleTree<any[]> | null;
  private argsToTypes: Record<CAItemType, string>;
  private custodyId: Hex;
  private readonly chainId: number;
  private readonly otcCustodyAddress: Address;

  constructor(chainId: number, otcCustodyAddress: Address) {
    this.chainId = chainId;
    this.otcCustodyAddress = otcCustodyAddress;
    this.custodyId = '0x' as Hex;
    this.caItems = [];
    this.merkleTree = null;
    this.argsToTypes = {
      deployConnector:
        'string connectorType,address factoryAddress,bytes callData',
      callConnector:
        'string connectorType,address connectorAddress,bytes callData',
      custodyToAddress: 'address receiver',
      custodyToConnector: 'address connectorAddress,address token',
      changeCustodyState: 'uint8 newState',
      custodyToCustody: 'bytes32 receiverId',
      updateCA: '', // No parameters
      updateCustodyState: '', // No parameters
    };
  }

  private encodeArgs(type: CAItemType, args: Record<string, any>): Hex {
    // Special case for empty parameters (like updateCA)
    if (this.argsToTypes[type] === '') {
      return '0x' as Hex;
    }

    const parsed = parseAbiParameters(this.argsToTypes[type]).slice(
      0,
      Object.keys(args).length
    );

    const argList: any[] = [];
    for (const { name } of parsed) {
      if (name && name in args) {
        argList.push(args[name]);
      }
    }

    return encodeAbiParameters(parsed, argList);
  }

  private encodeCalldata(funcType: string, funcArgs: any[]): Hex {
    // funcType example: "borrow(address,uint256)"
    // Ensure the selector is a valid Hex string
    const funcSig = toHex(funcType);
    const selector = keccak256(funcSig).slice(0, 10) as Hex;

    const paramTypes = funcType.slice(
      funcType.indexOf('(') + 1,
      funcType.lastIndexOf(')')
    );

    const params = encodeAbiParameters(
      parseAbiParameters(paramTypes).slice(0, funcArgs.length),
      funcArgs
    );

    // Convert to ByteArray first, then concat, then back to Hex
    const selectorBytes = hexToBytes(selector);
    const paramsBytes = hexToBytes(params);
    const concatenated = concat([selectorBytes, paramsBytes]);

    return toHex(concatenated);
  }

  private addItem(
    type: CAItemType,
    args: Record<string, any>,
    state: number,
    party: Party | Party[]
  ): number {
    let encodedArgs: Hex;

    // Handle special case for callConnector where callData might be an object
    if (
      type === 'callConnector' &&
      typeof args.callData === 'object' &&
      'type' in args.callData
    ) {
      const callDataObj = args.callData as { type: string; args: any[] };
      const callData = this.encodeCalldata(callDataObj.type, callDataObj.args);
      args = { ...args, callData };
    }

    encodedArgs = this.encodeArgs(type, args);

    const item: CAItemExpanded = {
      type,
      chainId: this.chainId,
      otcCustody: this.otcCustodyAddress,
      state,
      args: encodedArgs,
      party,
    };

    this.caItems.push(item);
    // Invalidate the tree so it will be rebuilt on next access
    this.merkleTree = null;

    // Return the index of the newly added item
    return this.caItems.length - 1;
  }

  // Implementation of all supported actions
  deployConnector(
    connectorType: string,
    factoryAddress: Address,
    callData: Hex,
    state: number,
    party: Party | Party[]
  ): number {
    return this.addItem(
      'deployConnector',
      { connectorType, factoryAddress, callData },
      state,
      party
    );
  }

  callConnector(
    connectorType: string,
    connectorAddress: Address,
    callData: { type: string; args: any[] } | Hex,
    state: number,
    party: Party | Party[]
  ): number {
    return this.addItem(
      'callConnector',
      { connectorType, connectorAddress, callData },
      state,
      party
    );
  }

  custodyToAddress(
    receiver: string,
    state: number,
    party: Party | Party[]
  ): number {
    return this.addItem('custodyToAddress', { receiver }, state, party);
  }

  custodyToConnector(
    connectorAddress: Address | string,
    token: Address | string,
    state: number,
    party: Party | Party[]
  ): number {
    return this.addItem(
      'custodyToConnector',
      { connectorAddress, token },
      state,
      party
    );
  }

  changeCustodyState(
    newState: number,
    state: number,
    party: Party | Party[]
  ): number {
    return this.addItem('changeCustodyState', { newState }, state, party);
  }

  custodyToCustody(
    receiverId: string | Hex,
    state: number,
    party: Party | Party[]
  ): number {
    return this.addItem('custodyToCustody', { receiverId }, state, party);
  }

  updateCA(state: number, party: Party | Party[]): number {
    return this.addItem(
      'updateCA',
      {}, // No parameters for updateCA
      state,
      party
    );
  }

  updateCustodyState(state: number, party: Party | Party[]): number {
    return this.addItem('updateCustodyState', {}, state, party);
  }

  // Get all CA items
  getCAItems(): CAItemExpanded[] {
    return this.caItems;
  }

  // Build or get the merkle tree
  private getMerkleTree(): StandardMerkleTree<any[]> {
    if (this.merkleTree !== null) {
      return this.merkleTree;
    }

    const values = this.caItems.flatMap((item) => {
      const parties = Array.isArray(item.party) ? item.party : [item.party];

      return parties.map((party) => [
        item.type,
        item.chainId,
        item.otcCustody,
        item.state,
        item.args,
        party.parity,
        pad(party.x),
      ]);
    });

    this.merkleTree = StandardMerkleTree.of(values, [
      'string', // entry type
      'uint256', // chainId
      'address', // otcCustody
      'uint8', // state
      'bytes', // abi.encode(args)
      'uint8', // party.parity
      'bytes32', // party.x
    ]);

    return this.merkleTree;
  }

  // Get custody ID (merkle root)
  getCustodyID(): Hex {
    const tree = this.getMerkleTree();
    return tree.root as Hex;
  }

  // Get merkle proof by index
  getMerkleProof(index: number): string[] {
    if (this.caItems.length == 1) {
      return []; // No proof for single item
    }
    if (index < 0 || index >= this.caItems.length) {
      throw new Error(
        `Invalid index: ${index}. Valid range is 0-${this.caItems.length - 1}`
      );
    }

    const tree = this.getMerkleTree();
    return tree.getProof(index);
  }

  // Get merkle proof by action details (useful when you have the action but not the index)
  getMerkleProofByAction(item: CAItemExpanded): string[] {
    const tree = this.getMerkleTree();

    // Fix the iteration issue by using Array.from() to convert the iterator to an array
    const entries = Array.from(tree.entries());

    const parties = Array.isArray(item.party) ? item.party : [item.party];

    for (const party of parties) {
      for (const [i, value] of entries) {
        if (
          value[0] === item.type &&
          value[1] === item.chainId &&
          value[2] === item.otcCustody &&
          value[3] === item.state &&
          value[4] === item.args &&
          value[5] === party.parity &&
          value[6] === pad(party.x)
        ) {
          return tree.getProof(i);
        }
      }
    }

    return [];
  }

  // Get merkle proof by action type and args
  getMerkleProofByTypeAndArgs(
    type: CAItemType,
    args: Record<string, any>,
    state: number,
    party: Party | Party[]
  ): string[] | [] {
    // Create a temporary item with the provided parameters
    let encodedArgs: Hex;

    // Handle special case for callConnector where callData might be an object
    if (
      type === 'callConnector' &&
      typeof args.callData === 'object' &&
      'type' in args.callData
    ) {
      const callDataObj = args.callData as { type: string; args: any[] };
      const callData = this.encodeCalldata(callDataObj.type, callDataObj.args);
      args = { ...args, callData };
    }

    encodedArgs = this.encodeArgs(type, args);

    const tempItem: CAItemExpanded = {
      type,
      chainId: this.chainId,
      otcCustody: this.otcCustodyAddress,
      state,
      args: encodedArgs,
      party,
    };

    // Use the existing function to find the proof
    return this.getMerkleProofByAction(tempItem);
  }

  // Get all actions with their corresponding indices and proofs
  getAllActionsWithProofs(): Array<{
    index: number;
    item: CAItemExpanded;
    proof: string[];
  }> {
    const tree = this.getMerkleTree();

    return this.caItems.map((item, index) => ({
      index,
      item,
      proof: tree.getProof(index),
    }));
  }

  // Clear all items
  clear(): void {
    this.caItems = [];
    this.merkleTree = null;
  }
}

export { CAHelper };
export type { CAItemExpanded, Party };
