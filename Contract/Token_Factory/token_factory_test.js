// No imports needed: web3, anchor, pg and more are globally available

describe("Test", () => {

  let randomStr = "es_neb";
  let randomNum1 = 2222;
  let randomNum2 = 2222;

  let params = { 
    name: "test_NEB", 
    symbol: "test_NEB", 
    uri: "https://gateway.pinata.cloud/ipfs/bafkreihfupo4ux73537z732o4pdxya4zyueqtlwljdmlwg6qiynonfyi7u", 
    totalSuply: new BN(100000000),
    giveUpAuth: false,
    randomStr: randomStr, 
    randomNum1: new BN(randomNum1), 
    randomNum2: new BN(randomNum2) 
  };

  function intToUint8Array(number: number) {
    const buffer = new ArrayBuffer(8);
    const dataView = new DataView(buffer);
    // dataView.setInt32(0, number, true);
    dataView.setBigInt64(0, BigInt(number), true);
    return new Uint8Array(buffer);
  }

  const contractPub = new web3.PublicKey("Cmbi81Rt4b6z1Cz2Qrzz9ERimFpCNgyvVSMex8ttAfxd");
  
  const [mintPub] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(randomStr), intToUint8Array(randomNum1), intToUint8Array(randomNum2)],
    contractPub,
  );

  const [allConfig] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("all_config")],
    contractPub,
  );

  const neb = new web3.PublicKey("2iVdnFrefRD3LWDiTvHNubsvojFBB5w1Kjn24RfbV26v");
  const esNeb = new web3.PublicKey("7haNNjjTjqhWRx89FNuh7Ykd3bGLQe1jR7VRH56AVxhY");
  

  const systemSigner = new web3.PublicKey("EhuFctMbCSQjZ1EHfZmAqZbnENouizVi8erFyNKaH4ay");

  const systemGetNebAccount = anchor.utils.token.associatedAddress({
    mint: neb,
    owner: systemSigner,
  });

  // it("create_token", async () => {

  //   const METADATA_P = new web3.PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s");

  //   const [metadataPub] = web3.PublicKey.findProgramAddressSync(
	// 			[Buffer.from('metadata'), METADATA_P.toBuffer(), mintPub.toBuffer()],
	// 			METADATA_P,
	// 		);

  //   const payerTokenAccountPub = await anchor.utils.token.associatedAddress({
  //     mint: mintPub,
  //     owner: pg.wallet.publicKey,
  //   });

  //   try{
  //     let txHash = await pg.program.methods
  //     .createToken(params)
  //     .accounts({
  //       mint:mintPub,
  //       metadata:metadataPub,
  //       signer: pg.wallet.publicKey,
  //       signerTokenAccount:payerTokenAccountPub,
  //       rent: new web3.PublicKey("SysvarRent111111111111111111111111111111111"),
  //       tokenProgram: new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  //       associatedTokenProgram: new web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),        
  //       systemProgram: web3.SystemProgram.programId,
  //       tokenMetadataProgram:METADATA_P,
  //     })
  //     .rpc();

  //     console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  //   }catch(err){
  //      console.log(err);
  //   }
    
  // });

  // it("config_system", async () => {

  //   let params = { 
  //     pauseMint: false, 
  //     neb: neb, 
  //     esNeb: esNeb 
  //   };

  //   try{
  //     let txHash = await pg.program.methods
  //     .configSystem(params)
  //     .accounts({
  //       allConfig: allConfig,
  //       signer: pg.wallet.publicKey,      
  //       systemProgram: web3.SystemProgram.programId,
  //     })
  //     .rpc();

  //     console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  //   }catch(err){
  //     console.log(err);
  //   }
  // });

  // it("black_list", async () => {

  //   const blackAddr = new web3.PublicKey("EhuFctMbCSQjZ1EHfZmAqZbnENouizVi8erFyNKaH4ay");

  //   const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("black_list"), blackAddr.toBuffer()],
  //     contractPub,
  //   );

  //   let txHash = await pg.program.methods
  //     .configBlackList(false)
  //     .accounts({
  //       blackAddr: blackAddr,
  //       userBlackInfo: userBlackInfo,
  //       signer: pg.wallet.publicKey,
  //       systemProgram: web3.SystemProgram.programId,
  //     })
  //     .rpc();

  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  // });

  // it("mint_token", async () => {

  //   const backendPublicKey  = pg.wallet.publicKey;
  //   const signerPubkey      = pg.wallet.publicKey;
  //   const amount            = 1000;
  //   const nonce             = 1;
  //   const timestamp         = Math.floor(Date.now() / 10000);

  //   // attach message：pubkey (32) + amount (8) + nonce (8) + timestamp (8)

  //   const message = Buffer.alloc(56);


  //   function u64ToBytesLE(value: bigint): Buffer {
  //     const bytes = Buffer.alloc(8);
  //     let temp = value;
  //     for (let i = 0; i < 8; i++) {
  //       bytes[i] = Number(temp & 0xffn);
  //       temp >>= 8n;
  //     }
  //     return bytes;
  //   }

  //   signerPubkey.toBuffer().copy(message, 0);
  //   u64ToBytesLE(BigInt(amount)).copy(message, 32);
  //   u64ToBytesLE(BigInt(nonce)).copy(message, 40);
  //   u64ToBytesLE(BigInt(timestamp)).copy(message, 48);
  
  //   const signature = await pg.wallet.signMessage(message);

  //   const ed25519Instruction = web3.Ed25519Program.createInstructionWithPublicKey({
  //     publicKey: backendPublicKey.toBytes(),
  //     message,
  //     signature,
  //   });

  //   let params = { 
  //     amount: new BN(amount), 
  //     nonce: new BN(nonce), 
  //     timestamp: new BN(timestamp),
  //     // amount: new BN(123), 
  //     // nonce: new BN(123),
  //     // timestamp: new BN(123), 
  //     signature: Array.from(signature), 
  //     randomStr: randomStr, 
  //     randomNum1: new BN(randomNum1), 
  //     randomNum2: new BN(randomNum2) 
  //   }

  //   const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("black_list"), pg.wallet.publicKey.toBuffer()],
  //     contractPub,
  //   );

  //   const signerTokenAccount = await anchor.utils.token.associatedAddress({
  //     mint: esNeb,
  //     owner: pg.wallet.publicKey,
  //   });

  //   const [mintCheck] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("mint_check"), pg.wallet.publicKey.toBuffer(), intToUint8Array(amount), intToUint8Array(nonce), intToUint8Array(timestamp)],
  //     contractPub,
  //   );

  //   try{
  //     const verifyAdminIx = await pg.program.methods
  //       .mintToken(params)
  //       .accounts({
  //         allConfig: allConfig,
  //         userBlackInfo: userBlackInfo,
  //         esNeb: esNeb,
  //         mintCheck: mintCheck,
  //         signer: pg.wallet.publicKey,
  //         signerTokenAccount: signerTokenAccount,
  //         systemProgram: web3.SystemProgram.programId,
  //         tokenProgram: new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  //         associatedTokenProgram: new web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),    
  //         instructionSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
  //       })
  //       .instruction();

  //     const tx = new web3.Transaction().add(ed25519Instruction).add(verifyAdminIx);

  //     // **设置最近区块哈希和手续费付者**
  //     const latestBlockhash = await pg.connection.getLatestBlockhash();
  //     tx.recentBlockhash = latestBlockhash.blockhash;
  //     tx.feePayer = pg.wallet.publicKey;

  //     const signedTx = await pg.wallet.signTransaction(tx);
  //     const txid = await pg.connection.sendRawTransaction(signedTx.serialize());

  //     await pg.connection.confirmTransaction(txid);

  //     console.log("Transaction ID:", txid);
  //   }catch(err){
  //     console.log(err);
  //   }

    
  // });

  // it("change_neb_2_es_neb", async () => {

  //   const signerNebAccount = anchor.utils.token.associatedAddress({
  //     mint: neb,
  //     owner: pg.wallet.publicKey,
  //   });

  //   const signerEsNebAccount = anchor.utils.token.associatedAddress({
  //     mint: esNeb,
  //     owner: pg.wallet.publicKey,
  //   });

  //   let params = { 
  //     amount: new BN(1000), 
  //     randomStr: randomStr, 
  //     randomNum1: new BN(randomNum1), 
  //     randomNum2: new BN(randomNum2) 
  //   };

  //   try{
  //     let txHash = await pg.program.methods
  //     .changeNebToEsNeb(params)
  //     .accounts({
  //       allConfig: allConfig,
  //       systemOwner: systemSigner,
  //       getNebAccount: systemGetNebAccount,
  //       neb: neb,
  //       esNeb: esNeb,
  //       signerNebAccount: signerNebAccount,
  //       signerEsNebAccount: signerEsNebAccount,
  //       signer: pg.wallet.publicKey,
  //       systemProgram: web3.SystemProgram.programId,
  //       tokenProgram: new web3.PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  //       associatedTokenProgram: new web3.PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"),    
  //     })
  //     .rpc();

  //     console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

  //   }catch(err){

  //     console.log(err)
  //   }

    
  // });
});
