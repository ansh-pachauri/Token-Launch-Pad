import { createInitializeMint2Instruction,getMinimumBalanceForRentExemptMint, MINT_SIZE, createMint, TYPE_SIZE, LENGTH_SIZE, getMintLen, createInitializeMetadataPointerInstruction, TOKEN_2022_PROGRAM_ID,TOKEN_PROGRAM_ID, createInitializeMintInstruction, ExtensionType, getMint, getMetadataPointerState, getTokenMetadata } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { SystemProgram, Transaction, Keypair, sendAndConfirmTransaction } from "@solana/web3.js";
import { createInitializeInstruction, createUpdateFieldInstruction, pack} from "@solana/spl-token-metadata"; 

export function TokenLaunchpad() {

    const wallet = useWallet();
    const {connection} = useConnection();

    async function createToken() {

        const name = document.getElementById('name').value;
        const symbol = document.getElementById('symbol').value;
        const image = document.getElementById('image').value;
        const supply = document.getElementById('supply').value;

        const mintkeypair = Keypair.generate();
        //metadata keypair shuold be stored in the metadatakeypair
        const metadataKeypair = Keypair.generate();


        //creatting the meta data for the token
        const metadata =({
            updateAuthority: wallet.publicKey,
            mint: mintkeypair.publicKey,
            name: "OPOS",
            symbol: "OPOS",
            uri: "https://raw.githubusercontent.com/solana-developers/opos-asset/main/assets/DeveloperPortal/metadata.json",
            additionalMetadata: [],
        })

        //size of new mint account
        const metadataExtension =TYPE_SIZE + LENGTH_SIZE;
        const metadataLen = pack(metadata).length;
        // Size of Mint Account with extension
        const mintLen = getMintLen([ExtensionType.MetadataPointer]);    

       const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataExtension + metadataLen, );

        //you first create an account for the token
        // then first create a keypair for this new account

    const transaction = new Transaction().add(
        SystemProgram.createAccount({
            fromPubkey: wallet.publicKey,  //user have to pay for this account so usr wallet public key bcz we cant access private key of user
            newAccountPubkey: mintkeypair.publicKey,
            space: MINT_SIZE,
            lamports,
            programId : TOKEN_PROGRAM_ID,
        }),

        // Instruction to initialize the MetadataPointer Extension
        createInitializeMetadataPointerInstruction(
            mintkeypair.publicKey,
            wallet.publicKey,
            metadataKeypair.publicKey,
            TOKEN_2022_PROGRAM_ID
        ),

        //initialize the mint account data
        createInitializeMint2Instruction(
            mintkeypair.publicKey,
            6,
            wallet.publicKey,
            null,
            TOKEN_2022_PROGRAM_ID
        ),

        // Instruction to initialize Metadata Account data

        

        // In the transaction, use the stored keypair

        createInitializeInstruction({
            programId: TOKEN_2022_PROGRAM_ID,
            metadata: metadataKeypair.publicKey, // Use stored keypair
            updateAuthority: wallet.publicKey,
            mint: mintkeypair.publicKey,
            mintAuthority: wallet.publicKey,
            name: metadata.name,
            symbol: metadata.symbol,
            uri: metadata.uri,
        }),

       
        
    );


    const recentBlockHash = await connection.getLatestBlockhash();
    transaction.recentBlockhash = recentBlockHash.blockhash;
    transaction.feePayer = wallet.publicKey;

    //sign the transaction
    const signedTx = await wallet.signTransaction(transaction);
        
        // Sign with the local keypairs
        signedTx.partialSign(mintkeypair);
        signedTx.partialSign(metadataKeypair);
        


    
    const signature = await sendAndConfirmTransaction(
        connection,
        signedTx,
        { commitment: 'confirmed' }
    );
    
    console.log("Transaction confirmed with signature:", signature);
    
    // await sendAndConfirmTransaction(transaction, connection, [mintkeypair]); 
    // console.log(signtrans);
    
    // read the mint account data
    const mintInfo = await getMint(
        connection,
        mintkeypair.publicKey,
        "confirmed",
        TOKEN_2022_PROGRAM_ID
    )
    //retrieve and log the matadata pointer state
    const metadataPointer = getMetadataPointerState(mintInfo);
    console.log("\nMetadata Pointer:", JSON.stringify(metadataPointer, null, 2));

    // Retrieve and log the metadata state
    const metadataLog = await getTokenMetadata(
        connection,
        mintkeypair.publicKey, // Mint Account address
    );
    console.log("\nMetadata:", JSON.stringify(metadataLog, null, 2));

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