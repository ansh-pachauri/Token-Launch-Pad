import { createInitializeMint2Instruction,getMinimumBalanceForRentExemptMint, MINT_SIZE, createMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction, Keypair } from "@solana/web3.js";

export function TokenLaunchpad() {

    const wallet = useWallet();
    const {connection} = useConnection();

    async function createToken() {

        const name = document.getElementById('name').value;
        const symbol = document.getElementById('symbol').value;
        const image = document.getElementById('image').value;
        const supply = document.getElementById('supply').value;

        const lamports = await getMinimumBalanceForRentExemptMint(connection);
        const keypair = Keypair.generate();

        //you first create an account for the token
        // then first create a keypair for this new account

    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,  //user have to pay for this account so usr wallet public key bcz we cant access private key of user
            newAccountPubkey: keypair.publicKey,
            space: MINT_SIZE,
            lamports,
            programId : TOKEN_PROGRAM_ID,
        }),
        //this is second inst. to put some data in the account
        createInitializeMint2Instruction(keypair.publicKey, 6, wallet.publicKey, wallet.public, TOKEN_PROGRAM_ID),
    );


    const recentBlockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockHash.blockhash;
    transaction.feePayer = wallet.publicKey;
    
    transaction.partialSign(keypair);  //signing the transaction with the mint keypair
    await wallet.signTransaction(transaction);  //signing the transaction with the user wallet

}


    return  <div style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column'
    }}>
        <h1>Solana Token Launchpad</h1>
        <input id="name" className='inputText' type='text' placeholder='Name'></input> <br />
        <input id="symbol" className='inputText' type='text' placeholder='Symbol'></input> <br />
        <input id="image" className='inputText' type='text' placeholder='Image URL'></input> <br />
        <input id="supply" className='inputText' type='text' placeholder='Initial Supply'></input> <br />
        <button className='btn' onClick={createToken}>Create a token</button>
    </div>
}