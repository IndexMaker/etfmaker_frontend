  Frontend Parteners refered as Frontend : They sell IndexMaker Indexes using our open source frontend code. They are incentivez by fee sharing of management and performance fees.
    Client : Non-KYC or KYB user, can be representing a Retail, Whale and Institution.
    Solver : KYC user, that hold custody of client's collateral and replicate Index.
    Currator : KYC user, that provide weights and theorical price for Index.
    Methodology : Process or logic to calculate Index price, update weights and follow governance.
    Custody Agrement : A set of smart contract coded defining currator and solver, and callable action by currator and/or solver. e.g. transfer to Ceffu, update weights, ...
    Index Governance : Holder of index can vote to update Custody Agreement.
    Index : ERC20 token representing the index. It can be redeemed for collateral. (Q Lawyer : Only KYC solver or any user? )
    OTCCustody : Custody smart contract that hold custody enforcing Collateral Agreement and storing collateral in certain cases.
    CEX : Centralized Exchange, Binance and Bitget.

Index Init and buy : 
    0. Solver deploy an Index token associated to an OTC Custody, a Custody Agreement, a Currator, and a Methodology.
    1. solver whitelist Index in it's backend and frontend, then market it.
    2. Client comes to one of the frontend and get an estimated quote at index price he can buy from Solver
    3. Client call deposits index.deposit who transfer client usdc to otcCustody
    4. Solver call OTCCustody to transfer collateral to ceffu or bitget or another blockchain ( Collateral routing to send coolaterl ) ( Process can take 15 minutes )
    5. Solver open position on CEXs to replicate Index
    6. Solver report execution price to Client and call index.mint() to mint accordingly index tokens to Client on collateral deposit chain.

Sell :
    0. Client call index.lockToken() to lock index tokens he owns. Tokens can only be
    1. Solver convert underlying asset to collateral on CEXs
    2. Solver transfer collateral to otcCustody
    3. Solver call index.burn() to burn index tokens locked
    4. Solver call index.withdraw() to withdraw collateral to client

Vote :
    Anyone can initiate a vote.
    On vote initialization, a snapshot of index holders is created.
    A voter can delegate to another address his vote. 
    Can vote, index holder who holded tokens during snapshot, voter that did delegate vote ( can be themself ) to anyone, smart contracts who implemented a delegation of vote..
    If a vote reach a share of token holders %.
    A vote expire after a time T since inception, if haven't reached vote trhsehold.    
    
    