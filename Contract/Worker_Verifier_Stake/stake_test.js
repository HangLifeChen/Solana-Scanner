// No imports needed: web3, anchor, pg and more are globally available

describe("Test", () => {
  const contractPub = new web3.PublicKey(
    "ArinV9ty3tdSXAZZBBtVfVuijUxt5KQiafGiVhLbfHSW"
  );

  const stakeToken = new web3.PublicKey(
    "7haNNjjTjqhWRx89FNuh7Ykd3bGLQe1jR7VRH56AVxhY"
  );

  const systemOwner = new web3.PublicKey(
    "EhuFctMbCSQjZ1EHfZmAqZbnENouizVi8erFyNKaH4ay"
  );

  const [allConfig] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("all_config")],
    contractPub
  );

  const allConfigAccount = anchor.utils.token.associatedAddress({
    mint: stakeToken,
    owner: allConfig,
  });

  function intToUint8Array(number: number) {
    const buffer = new ArrayBuffer(8);
    const dataView = new DataView(buffer);
    // dataView.setInt32(0, number, true);
    dataView.setBigInt64(0, BigInt(number), true);
    return new Uint8Array(buffer);
  }
  // it("config", async () => {
  //   let configParams = {
  //     workerUnstakeLockTime: new BN(60),
  //     verifierUnstakeLockTime: new BN(60),
  //     delegatorUnstakeLockTime: new BN(60),
  //     workerNeedCount: new BN(10000),
  //     verifierNeedCountL1: new BN(100000),
  //     verifierNeedCountL2: new BN(200000),
  //     verifierNeedCountL3: new BN(500000),
  //     verifierNeedCountL4: new BN(1000000),
  //     verifierNeedCountL5: new BN(5000000),
  //     allowUnstake: true,
  //   };

  //   const txHash = await pg.program.methods
  //     .config(configParams)
  //     .accounts({
  //       stakeToken: stakeToken,
  //       allConfig: allConfig,
  //       allConfigAccount: allConfigAccount,
  //       signer: pg.wallet.publicKey,
  //       tokenProgram: new web3.PublicKey(
  //         "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  //       ),
  //       associatedTokenProgram: new web3.PublicKey(
  //         "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  //       ),
  //       systemProgram: web3.SystemProgram.programId,
  //     })
  //     .rpc();
  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

  //   const allConfigAccountInfo = await pg.program.account.allConfig.fetch(
  //     allConfig
  //   );

  //   console.log(
  //     `all config info : -v ${JSON.stringify(allConfigAccountInfo, null, 2)}`
  //   );
  // });

  // it("add_black_list", async () => {

  //   const blackAddr = new web3.PublicKey(
  //     "EQ8wA7XLau7XrSCjWuaTGTk4kZfLFD3LABmz9e4uaKdo"
  //   );

  //   const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("black_list"), blackAddr.toBuffer()],
  //     contractPub
  //   );

  //   const txHash = await pg.program.methods
  //     .addBlackList()
  //     .accounts({
  //       blackAddr: blackAddr,
  //       userBlackInfo: userBlackInfo,
  //       signer: pg.wallet.publicKey,
  //       systemProgram: web3.SystemProgram.programId,
  //     })
  //     .rpc();
  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

  //   const blackList = await pg.program.account.blackList.fetch(
  //     userBlackInfo
  //   );

  //   console.log(`blackList info : -v ${JSON.stringify(blackList, null, 2)}`);
  // });

  // it("remove_black_list", async () => {

  //   const blackAddr = new web3.PublicKey(
  //     "EQ8wA7XLau7XrSCjWuaTGTk4kZfLFD3LABmz9e4uaKdo"
  //   );

  //   const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("black_list"), blackAddr.toBuffer()],
  //     contractPub
  //   );

  //   const txHash = await pg.program.methods
  //     .removeBlackList()
  //     .accounts({
  //       blackAddr: blackAddr,
  //       userBlackInfo: userBlackInfo,
  //       signer: pg.wallet.publicKey,
  //       systemProgram: web3.SystemProgram.programId,
  //     })
  //     .rpc();
  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

  //   const blackList = await pg.program.account.blackList.fetch(
  //     userBlackInfo
  //   );

  //   console.log(`blackList info : -v ${JSON.stringify(blackList, null, 2)}`);
  // });

  // it("confiscate", async () => {
  //   const signerAccount = anchor.utils.token.associatedAddress({
  //     mint: stakeToken,
  //     owner: pg.wallet.publicKey,
  //   });

  //   const txHash = await pg.program.methods
  //     .confiscate()
  //     .accounts({
  //       stakeToken: stakeToken,
  //       allConfig: allConfig,
  //       allConfigAccount: allConfigAccount,
  //       signer: pg.wallet.publicKey,
  //       signerAccount: signerAccount,
  //       systemProgram: web3.SystemProgram.programId,
  //     })
  //     .rpc();
  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

  // });

  // it("worker_stake", async () => {
  //   let stakeAmount = new BN(5000);

  //   const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("black_list"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );

  //   const [userStakeInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("stake_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );

  //   const signerAccount = anchor.utils.token.associatedAddress({
  //     mint: stakeToken,
  //     owner: pg.wallet.publicKey,
  //   });

  //   try {
  //     const txHash = await pg.program.methods
  //       .workerStake(stakeAmount)
  //       .accounts({
  //         stakeToken: stakeToken,
  //         allConfig: allConfig,
  //         allConfigAccount: allConfigAccount,
  //         userBlackInfo: userBlackInfo,
  //         userStakeInfo: userStakeInfo,
  //         signer: pg.wallet.publicKey,
  //         signerAccount: signerAccount,
  //         systemProgram: web3.SystemProgram.programId,
  //         tokenProgram: new web3.PublicKey(
  //           "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  //         ),
  //         associatedTokenProgram: new web3.PublicKey(
  //           "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  //         ),
  //       })
  //       .rpc();
  //     console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

  // it("worker_unstake", async () => {
  //   let unstakeAmount = new BN(1000);
  //   const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("black_list"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );
  //   const [userStakeInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("stake_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );
  //   const [userUnstakeInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("unstake_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );

  //   const txHash = await pg.program.methods
  //     .workerUnstake(unstakeAmount)
  //     .accounts({
  //       stakeToken: stakeToken,
  //       allConfig: allConfig,
  //       userBlackInfo: userBlackInfo,
  //       userStakeInfo: userStakeInfo,
  //       userUnstakeInfo: userUnstakeInfo,
  //       signer: pg.wallet.publicKey,
  //       systemProgram: web3.SystemProgram.programId,
  //       tokenProgram: new web3.PublicKey(
  //         "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  //       ),
  //       associatedTokenProgram: new web3.PublicKey(
  //         "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  //       ),
  //     })
  //     .rpc();
  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  // });

  // it("delegator_stake", async () => {
  //   let stakeAmount = new BN(5000);

  //   const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("black_list"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );

  //   const [userStakeInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("stake_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );

  //   const signerAccount = anchor.utils.token.associatedAddress({
  //     mint: stakeToken,
  //     owner: pg.wallet.publicKey,
  //   });

  //   const poolCreator = systemOwner;

  //   const [verifierPool] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("v_pool"), poolCreator.toBuffer()],
  //     contractPub
  //   );

  //   const [delegateInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("d_i"), pg.wallet.publicKey.toBuffer(), verifierPool.toBuffer()],
  //     contractPub,
  //   );

  //   try {
  //     const txHash = await pg.program.methods
  //       .delegatorStake(stakeAmount)
  //       .accounts({

  //         stake:{
  //           stakeToken: stakeToken,
  //           allConfig: allConfig,
  //           allConfigAccount: allConfigAccount,
  //           userBlackInfo: userBlackInfo,
  //           userStakeInfo: userStakeInfo,
  //           signer: pg.wallet.publicKey,
  //           signerAccount: signerAccount,
  //           systemProgram: web3.SystemProgram.programId,
  //           tokenProgram: new web3.PublicKey(
  //             "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  //           ),
  //           associatedTokenProgram: new web3.PublicKey(
  //             "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  //           ),
  //         },
  //         poolCreator: poolCreator,
  //         verifierPool: verifierPool,
  //         delegateInfo: delegateInfo,
  //       })
  //       .rpc();
  //     console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

  // it("delegator_unstake", async () => {
  //   let unstakeAmount = new BN(1000);
  //   const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("black_list"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );
  //   const [userStakeInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("stake_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );
  //   const [userUnstakeInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("unstake_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );

  //   const [verifierPool] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("v_pool"), systemOwner.toBuffer()],
  //     contractPub
  //   );

  //   const [delegateInfo] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("d_i"),
  //       pg.wallet.publicKey.toBuffer(),
  //       verifierPool.toBuffer(),
  //     ],
  //     contractPub
  //   );

  //   try {
  //     const txHash = await pg.program.methods
  //       .delegatorUnstake(unstakeAmount)
  //       .accounts({
  //         unstake: {
  //           stakeToken: stakeToken,
  //           allConfig: allConfig,
  //           userBlackInfo: userBlackInfo,
  //           userStakeInfo: userStakeInfo,
  //           userUnstakeInfo: userUnstakeInfo,
  //           signer: pg.wallet.publicKey,
  //           systemProgram: web3.SystemProgram.programId,
  //           tokenProgram: new web3.PublicKey(
  //             "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  //           ),
  //           associatedTokenProgram: new web3.PublicKey(
  //             "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  //           ),
  //         },
  //         poolCreator: systemOwner,
  //         verifierPool: verifierPool,
  //         delegateInfo: delegateInfo,
  //       })
  //       .rpc();
  //     console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

  it("verifier_stake", async () => {
    const backendPublicKey = new web3.PublicKey(
      "EhuFctMbCSQjZ1EHfZmAqZbnENouizVi8erFyNKaH4ay"
    );
    const signerPubkey = pg.wallet.publicKey;
    const amount = 100000;
    const nonce = 1233;
    const timestamp = Math.floor(Date.now() / 1000);
    // const timestamp = 1752564118;

    // attach message：pubkey (32) + amount (8) + nonce (8) + timestamp (8)

    const message = Buffer.alloc(56);

    function u64ToBytesLE(value: bigint): Buffer {
      const bytes = Buffer.alloc(8);
      let temp = value;
      for (let i = 0; i < 8; i++) {
        bytes[i] = Number(temp & 0xffn);
        temp >>= 8n;
      }
      return bytes;
    }

    signerPubkey.toBuffer().copy(message, 0);
    u64ToBytesLE(BigInt(amount)).copy(message, 32);
    u64ToBytesLE(BigInt(nonce)).copy(message, 40);
    u64ToBytesLE(BigInt(timestamp)).copy(message, 48);

    const signature = await pg.wallet.signMessage(message);

    // const signaturen = [
    //   80, 76, 145, 238, 17, 53, 245, 74, 73, 99, 252, 110, 147, 113, 196, 149,
    //   193, 71, 216, 253, 90, 162, 194, 156, 181, 77, 201, 167, 8, 129, 207, 225,
    //   226, 246, 81, 45, 219, 55, 241, 254, 76, 123, 9, 170, 210, 126, 250, 70,
    //   57, 154, 207, 94, 70, 30, 92, 113, 34, 251, 221, 98, 119, 106, 52, 7,
    // ];
    // const signature = new Uint8Array(signaturen);

    // console.log(signature);

    const ed25519Instruction =
      web3.Ed25519Program.createInstructionWithPublicKey({
        publicKey: backendPublicKey.toBytes(),
        message,
        signature,
      });

    let params = {
      stakeAmount: new BN(amount),
      nonce: new BN(nonce),
      timestamp: new BN(timestamp),
      signature: Array.from(signature),
    };

    const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("black_list"), pg.wallet.publicKey.toBuffer()],
      contractPub
    );

    const [userStakeInfo] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("stake_info"), pg.wallet.publicKey.toBuffer()],
      contractPub
    );

    const signerAccount = anchor.utils.token.associatedAddress({
      mint: stakeToken,
      owner: pg.wallet.publicKey,
    });

    const [verifierPool] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("v_pool"), pg.wallet.publicKey.toBuffer()],
      contractPub
    );

    const [stakeCheck] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from("s_c"), pg.wallet.publicKey.toBuffer(), intToUint8Array(amount), intToUint8Array(nonce), intToUint8Array(timestamp)],
      contractPub
    );

    try {
      const verifyAdminIx = await pg.program.methods
        .verifierStake(params)
        .accounts({
          stake: {
            stakeToken: stakeToken,
            allConfig: allConfig,
            allConfigAccount: allConfigAccount,
            userBlackInfo: userBlackInfo,
            userStakeInfo: userStakeInfo,
            signer: pg.wallet.publicKey,
            signerAccount: signerAccount,
            systemProgram: web3.SystemProgram.programId,
            tokenProgram: new web3.PublicKey(
              "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
            ),
            associatedTokenProgram: new web3.PublicKey(
              "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
            ),
          },
          stakeCheck: stakeCheck,
          instructionSysvar: web3.SYSVAR_INSTRUCTIONS_PUBKEY,
          verifierPool: verifierPool,
        })
        .instruction();

      console.log("Instruction data size:", verifyAdminIx.data.length);

      const tx = new web3.Transaction()
        .add(ed25519Instruction)
        .add(verifyAdminIx);

      const latestBlockhash = await pg.connection.getLatestBlockhash();
      tx.recentBlockhash = latestBlockhash.blockhash;
      tx.feePayer = pg.wallet.publicKey;

      const signedTx = await pg.wallet.signTransaction(tx);
      const txid = await pg.connection.sendRawTransaction(signedTx.serialize());

      await pg.connection.confirmTransaction(txid);

      console.log("Transaction ID:", txid);
    } catch (err) {
      console.log("Transaction Err:", err);
    }
  });

  // it("verifier_unstake", async () => {
  //   let unstakeAmount = new BN(1000);
  //   const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("black_list"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );
  //   const [userStakeInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("stake_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );
  //   const [userUnstakeInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("unstake_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );

  //   const [verifierPool] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("v_pool"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );

  //   const txHash = await pg.program.methods
  //     .verifierUnstake(unstakeAmount)
  //     .accounts({
  //       unstake: {
  //         stakeToken: stakeToken,
  //         allConfig: allConfig,
  //         userBlackInfo: userBlackInfo,
  //         userStakeInfo: userStakeInfo,
  //         userUnstakeInfo: userUnstakeInfo,
  //         signer: pg.wallet.publicKey,
  //         systemProgram: web3.SystemProgram.programId,
  //         tokenProgram: new web3.PublicKey(
  //           "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  //         ),
  //         associatedTokenProgram: new web3.PublicKey(
  //           "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  //         ),
  //       },
  //       poolCreator: pg.wallet.publicKey,
  //       verifierPool: verifierPool,
  //     })
  //     .rpc();
  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  // });

  // it("claim_worker_unstake", async () => {
  //   const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("black_list"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );
  //   const [userUnstakeInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("unstake_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );
  //   const signerAccount = anchor.utils.token.associatedAddress({
  //     mint: stakeToken,
  //     owner: pg.wallet.publicKey,
  //   });

  //   const txHash = await pg.program.methods
  //     .claimWorkerUnstake()
  //     .accounts({
  //       stakeToken: stakeToken,
  //       allConfig: allConfig,
  //       allConfigAccount: allConfigAccount,
  //       userBlackInfo: userBlackInfo,
  //       userUnstakeInfo: userUnstakeInfo,
  //       signer: pg.wallet.publicKey,
  //       signerAccount: signerAccount,
  //       systemProgram: web3.SystemProgram.programId,
  //       tokenProgram: new web3.PublicKey(
  //         "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  //       ),
  //       associatedTokenProgram: new web3.PublicKey(
  //         "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  //       ),
  //     })
  //     .rpc();
  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  // });

  // it("claim_verifier_unstake", async () => {
  //   const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("black_list"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );
  //   const [userUnstakeInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("unstake_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );
  //   const signerAccount = anchor.utils.token.associatedAddress({
  //     mint: stakeToken,
  //     owner: pg.wallet.publicKey,
  //   });

  //   const txHash = await pg.program.methods
  //     .claimVerifierUnstake()
  //     .accounts({
  //       stakeToken: stakeToken,
  //       allConfig: allConfig,
  //       allConfigAccount: allConfigAccount,
  //       userBlackInfo: userBlackInfo,
  //       userUnstakeInfo: userUnstakeInfo,
  //       signer: pg.wallet.publicKey,
  //       signerAccount: signerAccount,
  //       systemProgram: web3.SystemProgram.programId,
  //       tokenProgram: new web3.PublicKey(
  //         "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  //       ),
  //       associatedTokenProgram: new web3.PublicKey(
  //         "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  //       ),
  //     })
  //     .rpc();
  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  // });

  // it("claim_delegator_unstake", async () => {
  //   const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("black_list"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );
  //   const [userUnstakeInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("unstake_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );
  //   const signerAccount = anchor.utils.token.associatedAddress({
  //     mint: stakeToken,
  //     owner: pg.wallet.publicKey,
  //   });

  //   const [verifierPool] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("v_pool"), systemOwner.toBuffer()],
  //     contractPub
  //   );

  //   const [delegateInfo] = web3.PublicKey.findProgramAddressSync(
  //     [
  //       Buffer.from("d_i"),
  //       pg.wallet.publicKey.toBuffer(),
  //       verifierPool.toBuffer(),
  //     ],
  //     contractPub
  //   );

  //   const txHash = await pg.program.methods
  //     .claimDelegatorUnstake()
  //     .accounts({
  //       claimUnstake:{
  //         stakeToken: stakeToken,
  //         allConfig: allConfig,
  //         allConfigAccount: allConfigAccount,
  //         userBlackInfo: userBlackInfo,
  //         userUnstakeInfo: userUnstakeInfo,
  //         signer: pg.wallet.publicKey,
  //         signerAccount: signerAccount,
  //         systemProgram: web3.SystemProgram.programId,
  //         tokenProgram: new web3.PublicKey(
  //           "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  //         ),
  //         associatedTokenProgram: new web3.PublicKey(
  //           "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  //         ),
  //       },
  //       poolCreator: systemOwner,
  //       verifierPool: verifierPool,
  //       delegateInfo: delegateInfo,
  //     })
  //     .rpc();
  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  // });
});
