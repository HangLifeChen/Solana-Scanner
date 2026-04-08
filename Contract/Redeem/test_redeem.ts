// No imports needed: web3, anchor, pg and more are globally available

describe("Test", () => {
  const contractPub = new web3.PublicKey(
    "5amMoApspFfLLKf2WU6tJ8DcYbHqVJ7tCthZTKd9eEr4"
  );

  const neb = new web3.PublicKey(
    "2iVdnFrefRD3LWDiTvHNubsvojFBB5w1Kjn24RfbV26v"
  );

  const esNeb = new web3.PublicKey(
    "7haNNjjTjqhWRx89FNuh7Ykd3bGLQe1jR7VRH56AVxhY"
  );

  const tokenProgram = new web3.PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  );
  const associatedTokenProgram = new web3.PublicKey(
    "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
  );

  const [allConfig] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("all_config")],
    contractPub
  );

  const allConfigNebAccount = anchor.utils.token.associatedAddress({
    mint: neb,
    owner: allConfig,
  });

  const allConfigEsNebAccount = anchor.utils.token.associatedAddress({
    mint: esNeb,
    owner: allConfig,
  });

  const [userBlackInfo] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("black_list"), pg.wallet.publicKey.toBuffer()],
    contractPub
  );

  const [allVaultInfo] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("all_v_info")],
    contractPub
  );

  const [rewardArray] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("reward_array")],
    contractPub
  );

  // it("config", async () => {

  //   let params = {
  //     allowRedeem: true,
  //     decimals: new BN(6),
  //   };

  //   try{
  //     const txHash = await pg.program.methods
  //     .config(params)
  //     .accounts({
  //       allConfig: allConfig,
  //       esNeb: esNeb,
  //       neb: neb,
  //       signer: pg.wallet.publicKey,
  //       systemProgram: web3.SystemProgram.programId,
  //     })
  //     .rpc();
  //     console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  //   }catch(err){
  //     console.log(err);
  //   }
  // });

  // it("update_black_list", async () => {

  //   const need_block_this_user = false;

  //   const blackAddr = new web3.PublicKey("EhuFctMbCSQjZ1EHfZmAqZbnENouizVi8erFyNKaH4ay");

  //   try{
  //     const txHash = await pg.program.methods
  //     .updateBlackList(need_block_this_user)
  //     .accounts({
  //       blackAddr: blackAddr,
  //       userBlackInfo: userBlackInfo,
  //       signer: pg.wallet.publicKey,
  //       systemProgram: web3.SystemProgram.programId,
  //     })
  //     .rpc();
  //     console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  //   }catch(err){
  //     console.log(err);
  //   }
  // });

  // it("config_stake", async () => {

  //   const stake_amount = new BN(2000000);

  //   const allConfigNebAccount = await anchor.utils.token.associatedAddress({
  //     mint: neb,
  //     owner: allConfig,
  //   });

  //   const signerAccount = await anchor.utils.token.associatedAddress({
  //     mint: neb,
  //     owner: pg.wallet.publicKey,
  //   });

  //   try{
  //     const txHash = await pg.program.methods
  //     .configStake(stake_amount)
  //     .accounts({
  //       neb: neb,
  //       allConfigNebAccount: allConfigNebAccount,
  //       allConfig: allConfig,
  //       signerAccount: signerAccount,
  //       signer: pg.wallet.publicKey,
  //       systemProgram: web3.SystemProgram.programId,
  //       tokenProgram: tokenProgram,
  //       associatedTokenProgram: associatedTokenProgram,
  //     })
  //     .rpc();
  //     console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  //   }catch(err){
  //     console.log(err);
  //   }
  // });

  // it("config_confiscate", async () => {
  //   const allConfigNebAccount = await anchor.utils.token.associatedAddress({
  //     mint: neb,
  //     owner: allConfig,
  //   });

  //   const signerAccount = await anchor.utils.token.associatedAddress({
  //     mint: neb,
  //     owner: pg.wallet.publicKey,
  //   });

  //   try {
  //     const txHash = await pg.program.methods
  //       .configConfiscate()
  //       .accounts({
  //         neb: neb,
  //         allConfigNebAccount: allConfigNebAccount,
  //         allConfig: allConfig,
  //         signerAccount: signerAccount,
  //         signer: pg.wallet.publicKey,
  //         systemProgram: web3.SystemProgram.programId,
  //         tokenProgram: tokenProgram,
  //         associatedTokenProgram: associatedTokenProgram,
  //       })
  //       .rpc();
  //     console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

  // it("redeem", async () => {
  //   let param = {
  //     amount: new BN(370285),
  //     redeemType: 1,
  //   };

  //   const signerAccount = await anchor.utils.token.associatedAddress({
  //     mint: esNeb,
  //     owner: pg.wallet.publicKey,
  //   });

  //   const [userVaultInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("user_v_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );

  //   const [userRedeemInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("redeem"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );

  //   try {
  //     const txHash = await pg.program.methods
  //       .redeem(param)
  //       .accounts({
  //         allConfigEsNebAccount: allConfigEsNebAccount,
  //         allConfig: allConfig,
  //         esNeb: esNeb,

  //         vault: {
  //           rewardArray: rewardArray,
  //           userBlackInfo: userBlackInfo,
  //           allVaultInfo: allVaultInfo,
  //           userVaultInfo: userVaultInfo,
  //         },
  //         userRedeemInfo: userRedeemInfo,
  //         signerAccount: signerAccount,
  //         signer: pg.wallet.publicKey,
  //         systemProgram: web3.SystemProgram.programId,
  //         tokenProgram: tokenProgram,
  //         associatedTokenProgram: associatedTokenProgram,
  //       })
  //       .rpc();
  //     console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

  // it("redeem_claim", async () => {

  //   const signerAccount = await anchor.utils.token.associatedAddress({
  //     mint: neb,
  //     owner: pg.wallet.publicKey,
  //   });

  //   const [userRedeemInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("redeem"), pg.wallet.publicKey.toBuffer()],
  //     contractPub,
  //   );
  //   const [userVaultInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("user_v_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );
  //   try{
  //     const txHash = await pg.program.methods
  //       .redeemClaim()
  //       .accounts({
  //         allConfigNebAccount: allConfigNebAccount,
  //         allConfig: allConfig,
  //         neb: neb,

  //         vault:{
  //           userBlackInfo: userBlackInfo,
  //           rewardArray: rewardArray,
  //           allVaultInfo: allVaultInfo,
  //           userVaultInfo: userVaultInfo,
  //         },
  //         userRedeemInfo: userRedeemInfo,
  //         signerAccount: signerAccount,
  //         signer: pg.wallet.publicKey,
  //         systemProgram: web3.SystemProgram.programId,
  //         tokenProgram: tokenProgram,
  //         associatedTokenProgram: associatedTokenProgram,
  //       })
  //       .rpc();
  //     console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);

  //   }catch(err){
  //     console.log(err);
  //   }
  // });

  // it("vault", async () => {
  //   let amount = new BN(10);

  //   const signerAccount = await anchor.utils.token.associatedAddress({
  //     mint: neb,
  //     owner: pg.wallet.publicKey,
  //   });

  //   const [userVaultInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("user_v_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );

  //   const txHash = await pg.program.methods
  //     .vault(amount)
  //     .accounts({
  //       allConfigNebAccount: allConfigNebAccount,
  //       allConfig: allConfig,
  //       neb: neb,
  //       vault: {
  //         userBlackInfo: userBlackInfo,
  //         rewardArray: rewardArray,
  //         allVaultInfo: allVaultInfo,
  //         userVaultInfo: userVaultInfo,
  //       },
  //       signerAccount: signerAccount,
  //       signer: pg.wallet.publicKey,
  //       systemProgram: web3.SystemProgram.programId,
  //       tokenProgram: tokenProgram,
  //       associatedTokenProgram: associatedTokenProgram,
  //     })
  //     .rpc();
  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  // });

  // it("unvault", async () => {

  //   const signerAccount = await anchor.utils.token.associatedAddress({
  //     mint: neb,
  //     owner: pg.wallet.publicKey,
  //   });

  //   const [userVaultInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("user_v_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );

  //   const txHash = await pg.program.methods
  //     .unvault()
  //     .accounts({
  //       allConfigNebAccount: allConfigNebAccount,
  //       allConfig: allConfig,
  //       neb: neb,
  //       vault: {
  //         userBlackInfo: userBlackInfo,
  //         rewardArray: rewardArray,
  //         allVaultInfo: allVaultInfo,
  //         userVaultInfo: userVaultInfo,
  //       },
  //       signerAccount: signerAccount,
  //       signer: pg.wallet.publicKey,
  //       systemProgram: web3.SystemProgram.programId,
  //       tokenProgram: tokenProgram,
  //       associatedTokenProgram: associatedTokenProgram,
  //     })
  //     .rpc();
  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  // });

  // it("vault_claim", async () => {

  //   const signerAccount = await anchor.utils.token.associatedAddress({
  //     mint: neb,
  //     owner: pg.wallet.publicKey,
  //   });

  //   const [userVaultInfo] = web3.PublicKey.findProgramAddressSync(
  //     [Buffer.from("user_v_info"), pg.wallet.publicKey.toBuffer()],
  //     contractPub
  //   );

  //   const txHash = await pg.program.methods
  //     .vaultClaim()
  //     .accounts({
  //       allConfigNebAccount: allConfigNebAccount,
  //       allConfig: allConfig,
  //       neb: neb,
  //       vault: {
  //         userBlackInfo: userBlackInfo,
  //         rewardArray: rewardArray,
  //         allVaultInfo: allVaultInfo,
  //         userVaultInfo: userVaultInfo,
  //       },
  //       signerAccount: signerAccount,
  //       signer: pg.wallet.publicKey,
  //       systemProgram: web3.SystemProgram.programId,
  //       tokenProgram: tokenProgram,
  //       associatedTokenProgram: associatedTokenProgram,
  //     })
  //     .rpc();
  //   console.log(`Use 'solana confirm -v ${txHash}' to see the logs`);
  // });

  // it("query_reward", async () => {
  //   try {

  //     const check_wallet = new web3.PublicKey("FqgJpfFWg9WAV1bMNh2jmXYo3rMxo29rgyaus6ycnJiX");
  //     const release_day = 3;
  //     // const check_wallet = pg.wallet.publicKey;

  //     const [rewardArrayPubkey] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("reward_array")],
  //       contractPub
  //     );

  //     const accountInfo = await pg.connection.getAccountInfo(rewardArrayPubkey);

  //     const buf = accountInfo.data;
  //     let reward_array: number[] = [];

  //     for (let i = 0; i < release_day; i++) {
  //       const start = i * 8;
  //       const end = start + 8;
  //       const slice = buf.slice(start, end);

  //       // little endian u64
  //       const value = new BN(slice, "le").toNumber();
  //       reward_array.push(value);
  //     }

  //     const all_vault_info = await pg.program.account.allVaultInfo.fetch(
  //       allVaultInfo
  //     );

  //     const [userVaultInfo] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("user_v_info"), check_wallet.toBuffer()],
  //       contractPub
  //     );

  //     const user_vault_info = await pg.program.account.userVaultInfo.fetch(
  //       userVaultInfo
  //     );

  //     // console.log("reward_array:", JSON.stringify(reward_array));
  //     console.log("before all_vault_info:", JSON.stringify(all_vault_info));
  //     console.log("before user_vault_info:", JSON.stringify(user_vault_info));

  //     const now_time = Math.floor(Date.now() / 1000);
  //     let now_day_index = Math.floor((now_time / 86400) % release_day);

  //     console.log("now_day_index:", now_day_index);

  //     if (all_vault_info.dayIndex != now_day_index) {
  //       let duration;

  //       if (all_vault_info.dayIndex < now_day_index) {
  //         duration = Math.floor(now_day_index - all_vault_info.dayIndex);
  //       } else {
  //         duration = Math.floor(release_day - all_vault_info.dayIndex + now_day_index);
  //       }

  //       let sum_of_release = new BN(0);
  //       let i = all_vault_info.dayIndex + 1;

  //       while (true) {
  //         sum_of_release = sum_of_release.add(new BN(reward_array[i % release_day]));
  //         reward_array[i % release_day] = 0;
  //         i += 1;
  //         if (i > all_vault_info.dayIndex + duration) {
  //           break;
  //         }
  //       }

  //       all_vault_info.nowDayRelease = new BN(sum_of_release)
  //         .div(new BN(86400))
  //         .toNumber();
  //       all_vault_info.dayIndex = now_day_index;

  //       if (!all_vault_info.totalVault.eqn(0)) {
  //         var tmp1 = new BN(now_time).sub(all_vault_info.timeLast);
  //         var tmp2 = new BN(all_vault_info.nowDayRelease * tmp1.toNumber())
  //           .div(all_vault_info.totalVault)
  //           .toNumber();

  //         all_vault_info.sNow += tmp2;
  //       } else {
  //         all_vault_info.sNow = 0;
  //       }

  //       all_vault_info.timeLast = new BN(now_time);
  //     }

  //     if (
  //       user_vault_info.vaultAmount.eqn(0) ||
  //       user_vault_info.vVaultAmount.eqn(0)
  //     ) {
  //       var tmp1 = new BN(now_time).sub(all_vault_info.timeLast);

  //       all_vault_info.sNow +=
  //         (all_vault_info.nowDayRelease * tmp1.toNumber()) /
  //         all_vault_info.totalVault.toNumber();

  //       var tmp3 = new BN(0)
  //         .add(user_vault_info.vaultAmount)
  //         .add(user_vault_info.vVaultAmount)
  //         .toNumber();

  //       if (all_vault_info.sNow - user_vault_info.sDelegator != 0) {
  //         var tmp4 = tmp3 * (all_vault_info.sNow - user_vault_info.sDelegator);

  //         user_vault_info.waitClaim = new BN(user_vault_info.waitClaim).add(
  //           new BN(tmp4)
  //         );
  //       }
  //     }
  //     // console.log(userVaultInfo.toString());
  //     // console.log(allVaultInfo.toString());

  //     // console.log("reward_array:", JSON.stringify(reward_array));
  //     console.log("after all_vault_info:", JSON.stringify(all_vault_info));
  //     console.log("after user_vault_info:", JSON.stringify(user_vault_info));
  //     console.log(user_vault_info.waitClaim.toNumber());
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

  //   it("check", async () => {

  //   try{
  //     const [rewardArrayPubkey] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("reward_array")],
  //       contractPub
  //     );

  //     const accountInfo = await pg.connection.getAccountInfo(rewardArrayPubkey);

  //     const buf = accountInfo.data;
  //     let reward_array: number[] = [];

  //     for (let i = 0; i < 180; i++) {
  //       const start = i * 8;
  //       const end = start + 8;
  //       const slice = buf.slice(start, end);

  //       // little endian u64
  //       const value = new BN(slice, "le").toNumber();
  //       reward_array.push(value);
  //     }

  //     const all_vault_info = await pg.program.account.allVaultInfo.fetch(
  //       allVaultInfo
  //     );

  //     const [userVaultInfo] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("user_v_info"), pg.wallet.publicKey.toBuffer()],
  //       contractPub
  //     );

  //     const user_vault_info = await pg.program.account.userVaultInfo.fetch(
  //       userVaultInfo
  //     );

  //     // console.log(userVaultInfo.toString());
  //     // console.log(allVaultInfo.toString());

  //     console.log("reward_array:", JSON.stringify(reward_array));
  //     console.log("all_vault_info:", JSON.stringify(all_vault_info));
  //     console.log("user_vault_info:", JSON.stringify(user_vault_info));
  //   }catch(err)
  //   {
  //     console.log(err)
  //   }

  // });

  // it("query_redeem_claim", async () => {

  //   try{

  //     const [userRedeemInfo] = web3.PublicKey.findProgramAddressSync(
  //       [Buffer.from("redeem"), pg.wallet.publicKey.toBuffer()],
  //       contractPub,
  //     );

  //     const user_redeem_info = await pg.program.account.userRedeemInfo.fetch(userRedeemInfo);

  //     console.log(JSON.stringify(user_redeem_info));

  //     const now_time = Math.floor(Date.now() / 1000);

  //     if(!user_redeem_info.ongoingRedeem.eqn(0)){

  //       if (user_redeem_info.endTime.toNumber() <= now_time){
  //         user_redeem_info.waitClaim = user_redeem_info.waitClaim.add(user_redeem_info.ongoingRedeem);
  //       }else{
  //         let new_wait_claim				= (user_redeem_info.ongoingRedeem.toNumber() * ((now_time - user_redeem_info.startTime.toNumber()) / (user_redeem_info.endTime.sub(user_redeem_info.startTime).toNumber())));
  //         user_redeem_info.waitClaim = user_redeem_info.waitClaim.addn(new_wait_claim);
  //       }
  //     }

  //     console.log(user_redeem_info.waitClaim.toNumber());
  //   }catch(err)
  //   {
  //     console.log(err)
  //   }

  // });

  it("apy", async () => {

    try{

      const all_vault_info = await pg.program.account.allVaultInfo.fetch(allVaultInfo);

      let one_day_release = all_vault_info.nowDayRelease * 86400;

      let apy = Math.pow((1 + one_day_release / all_vault_info.totalVault.toNumber()), 365) - 1;

      console.log(apy);
    }catch(err)
    {
      console.log(err)
    }

  });
});
