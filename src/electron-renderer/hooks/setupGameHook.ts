import { EVENTS, WroldEvent } from "renderer/events/eventConst";
import { ProtocolDefine } from "renderer/gameConst";

function setupMsgHandler() {
  const msgHandler = window.nato.Network.addMsgHandler;

  function bindMsgHandler(protocol: number, callback: Function) {
    msgHandler?.(protocol, callback, window.MsgHandler.instance);
  }

  // Bag
  // 整理背包
  bindMsgHandler(ProtocolDefine.CG_BAG_CLEAN, (...args: any[]) => {
    window.__myEvent__.emit(EVENTS.BAG_CLEAN, ...args);
  });

  bindMsgHandler(ProtocolDefine.CG_SCENE_GO_CITY, () => {
    window.__myEvent__.emit(EVENTS.ENTER_CITY);
  });

  // ESCORT
  bindMsgHandler(ProtocolDefine.CG_TASK_ESCORT_START, () => {
    window.__myEvent__.emit(EVENTS.ENTER_ESCORT_MAP);
  });

  bindMsgHandler(ProtocolDefine.CG_TASK_ESCORT_MOVE, () => {
    window.__myEvent__.emit(EVENTS.MOVE_ESCORT_MAP);
  });

  bindMsgHandler(ProtocolDefine.CG_TASK_ESCORT_CHOICE_EVENT, () => {
    window.__myEvent__.emit(EVENTS.CHECK_ESCORT_EVENT);
  });

  bindMsgHandler(ProtocolDefine.CG_TASK_ESCORT_CANCEL, () => {
    window.__myEvent__.emit(EVENTS.EXIT_ESCORT_MAP);
  });

  // Battle
  bindMsgHandler(ProtocolDefine.CG_FIGHT_BATTLE_UPDATE, () => {
    console.log("更新战斗: ");
  });

  bindMsgHandler(ProtocolDefine.CG_FIGHT_ENTER_PLAYER_REMOTEBATTLE_EXIT, () => {
    console.log("退出战斗: ");
  });

  // City
  bindMsgHandler(ProtocolDefine.CG_SCENE_GO_CITY, () => {
    window.__myEvent__.emit(EVENTS.ENTER_CITY);
  });

  // Sell
  bindMsgHandler(ProtocolDefine.CG_AUTO_SELL, () => {
    setTimeout(() => window.__myEvent__.emit(EVENTS.SELL_ENDED));
  });

  // useItem
  bindMsgHandler(ProtocolDefine.CG_ACTOR_PLAYERBAG, () => {
    setTimeout(() => window.__myEvent__.emit(EVENTS.USED_ITEM));
  });
}

export default function setupGameHook() {
  // 修理装备但是不进行提示
  window.xworld.doRepairEquipNoAlert = function () {
    var t = window.xself;
    if (null != t) {
      var e = -1,
        n = function (n: any) {
          if (!window.MsgHandler.isMessageHaveError(n)) {
            var i = n.getInt();
            t.setMoneyByType(window.ModelConst.MONEY3, i),
              window.PlayerBag.repairEquip(t, e, !1),
              window.PanelManager.mainMenu &&
                window.PanelManager.mainMenu.stage &&
                window.PanelManager.mainMenu.updateWorldIconPoint(),
              window.AlertPanel.alertCommon(
                window.GameText.STR_REPAIR_EQUIP_SURE_SUCCESS
              ),
              window.xself.checkPower();
          }
        },
        i = () => {
          var t = new window.nato.Message(window.ProtocolDefine.CG_BAG_REPAIR);
          t.putShort(e), window.nato.Network.sendCmd(t, n, this);
        };

      i();
    }
  };

  // 退出 Battle 后
  window.MsgHandler.processAfterBattlePoint = function (
    t: any,
    e: any,
    n: any
  ) {
    if (null != t && null != e) {
      if (n) {
        var i = window.PowerString.makeColorString(
          "背包已满，无法获得物品",
          window.ColorUtils.COLOR_RED
        );
        window.WorldMessage.addPromptMsg(i),
          window.OneKeyDailyMission.isDoingOnekeyMission &&
            window.AutoSell.autoSell_onekeyDailyMission();
        window.__myEvent__.emit(EVENTS.BAG_FULL);
      } else if (t.bag.countFreePos() < 6) {
        var i = window.PowerString.makeColorString(
          "背包将满，请尽快清理",
          window.ColorUtils.COLOR_RED
        );
        window.WorldMessage.addPromptMsg(i);
        window.__myEvent__.emit(EVENTS.BAG_WILL_FULL);
      }
      var o = t.get(window.ModelConst.HP);
      if (0 >= o || t.get(window.ModelConst.HPMAX) / o > 4) {
        var i = window.PowerString.makeColorString(
          window.GameText.STR_HP_UNDER_QUARTER,
          window.ColorUtils.COLOR_RED
        );
        window.WorldMessage.addPromptMsg(i);
      }
    }
  };

  window.BattleView.prototype.initBattle = function () {
    const { xworld, GameWorld, BattleConst, Main, Battle, BattleView } = window;

    (xworld.inBattle = !0),
      this.openBattleUI(),
      this.initBottomBg(),
      (this.battleX = 0),
      (this.battleY = 0),
      (this.battleWidth = Main.instance.stage.stageWidth),
      (this.battleHeight = Main.instance.stage.stageHeight);
    var t = this.battle.rowLeft,
      n = this.battle.rowRight,
      i = BattleView.BATTLE_TOP_HEIGHT,
      o = BattleView.BATTLE_BOTTOM_HEIGHT,
      a = this.battleX,
      r = this.battleWidth,
      s = this.battleY + i,
      l = this.battleHeight - i - o,
      _ = this.getOffsetY(l, t),
      h = this.getOffsetY(l, n);
    this.initBattlePosition(a, s, r, l, _, t, !1),
      this.initBattlePosition(a, s, r, l, h, n, !0);
    for (var u = 0; u < Battle.MAX_POS; u++) {
      var c = this.getPlayerByPos(u);
      this.addBattlePlayer(c, u);
    }
    this.check(),
      1 == GameWorld.useGuide &&
        (GameWorld.isLoginSetting(GameWorld.IS_GUIDE_BATTLE_DOING)
          ? (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_BATTLE_DOING),
            this.setGuide(BattleConst.TAG_IS_GUIDE_ATTACK_MENU))
          : GameWorld.isLoginSetting(GameWorld.IS_GUIDE_BATTLE_AUTO)
          ? (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_BATTLE_AUTO),
            this.setGuide(BattleConst.TAG_IS_GUIDE_ATTACK_AUTO))
          : GameWorld.isLoginSetting(GameWorld.IS_GUIDE_OPEN_BATTLE_SKILL) &&
            (GameWorld.setLoginSetting(
              !1,
              GameWorld.IS_GUIDE_OPEN_BATTLE_SKILL
            ),
            this.setGuide(BattleConst.TAG_IS_GUIDE_OPEN_SKILL)),
        GameWorld.isLoginSetting(GameWorld.IS_GUIDE_SKIP_ROUND)
          ? (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_SKIP_ROUND),
            this.setGuide(BattleConst.TAG_IS_GUIDE_SKIP_ROUND))
          : GameWorld.isLoginSetting(GameWorld.IS_GUIDE_SKIP_BATTLE) &&
            (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_SKIP_BATTLE),
            this.setGuide(BattleConst.TAG_IS_GUIDE_SKIP_BATTLE)));

    window.__myEvent__.emit(EVENTS.ENTER_BATTLE_MAP);
  };

  // @ts-ignore
  window.BattleView.prototype.exit = function () {
    const {
      xworld,
      GuideHandler,
      PanelManager,
      Main,
      GameWorld,
      MsgHandler,
      Define,
      nato,
      BattleConst,
      SkyArena,
      CountryBoss,
      TeamBoss,
      OneKeyDailyMission,
      ItemManager,
      xself,
      Mission,
      AutoGamer,
      Battle,
    } = window;

    (xworld.inBattle = !1),
      (xworld.inBattleResult = !1),
      (xworld.readyToBattle = !1),
      GuideHandler.setGuideWidgetVisible(!0),
      this.clear(),
      this.closeBattleUI(),
      (this.endCountTime = -1);
    var t = 2 == this.battle.result;
    if (
      (this.battle.resetBattleResult(),
      PanelManager.closeBattleResult(),
      Main.instance.removeBattleItemView(),
      this.removeChildren(),
      this.parent && this.parent.removeChild(this),
      1 == GameWorld.useGuide &&
        GameWorld.isLoginSetting(GameWorld.IS_GUIDE_SEL_AUTO_SKILL) &&
        (GameWorld.setLoginSetting(!1, GameWorld.IS_GUIDE_SEL_AUTO_SKILL),
        GameWorld.setGuide(GameWorld.GUIDE_SEL_AUTO_SKILL)),
      xworld.battleChangeMap)
    ) {
      xworld.battleChangeMap = !1;
      var e = MsgHandler.createWorldDataMessage(
        Define.SIMPLE_FLASH_DATA_FLAG,
        !0
      );
      nato.Network.sendCmd(e);
    }
    if (
      ((null == xworld.npcList || 0 == xworld.npcList.length) &&
        MsgHandler.createWorldDataReflashMsg(),
      null != GameWorld.skyarena)
    )
      return void (
        this.isTag(BattleConst.TAG_IS_BATTLE_SEE) ||
        (false == t
          ? GameWorld.skyarena.setStatus(
              !0,
              SkyArena.SKYARENA_STAGE_BATTLE_FAIL
            )
          : GameWorld.skyarena.setStatus(
              !0,
              SkyArena.SKYARENA_STAGE_BATTLE_WIN
            ))
      );
    if (null != GameWorld.countryBoss)
      return (
        GameWorld.countryBoss.setStatus(!t, CountryBoss.STATUS_FIGHT_FAIL),
        void GameWorld.countryBoss.setStatus(!0, CountryBoss.STATUS_FIGHT_EXIT)
      );
    if (null != GameWorld.teamBoss)
      return (
        GameWorld.teamBoss.setStatus(!t, TeamBoss.STATUS_FIGHT_FAIL),
        void GameWorld.teamBoss.setStatus(!0, TeamBoss.STATUS_FIGHT_EXIT)
      );
    !t &&
      GameWorld.countryWar &&
      (GameWorld.countryWar.clearUpdate(), (GameWorld.countryWar = null)),
      OneKeyDailyMission.isDoingOnekeyMission &&
        false == t &&
        ItemManager.doQuickAddHP(xself);
    var n = Mission.checkBattleMissionFinish();
    if (
      (0 == n && AutoGamer.checkAutoGameEnable() && AutoGamer.autoFindMission(),
      this.battle.type != Battle.LOCAL && null == GameWorld.getEscort())
    ) {
      var i = Define.SIMPLE_FLASH_DATA_FLAG,
        e = MsgHandler.createWorldDataMessage(i, !1);
      nato.Network.sendCmd(e);
    }

    window.__myEvent__.emit(EVENTS.EXIT_BATTLE_MAP);
  };

  window.xevent.addEventListener(WroldEvent.ITEM_SELL_END, () => {
    window.__myEvent__.emit(WroldEvent.ITEM_SELL_END);
  });

  window.Escort.doEscortMove = function (e: any, n: any) {
    const {
      Escort,
      AlertPanel,
      PanelManager,
      MenuActionData,
      PopUpManager,
      MsgHandler,
      nato,
    } = window;

    if (null == e) return !1;
    if (0 == this.isCanMove(e, n)) return !1;
    var i = e.getRowByIndex(n),
      o = e.getColByIndex(n);
    e.setStatus(!0, Escort.STATUS_MOVE);
    var a = function (n: any) {
        Escort.doEscortEventMsg(e, n);
      },
      // @ts-ignore
      r = function (this: any, n: any) {
        PanelManager.closeWaitForServer();
        var i = n.getByte();
        if (0 > i) return void AlertPanel.errorMessage(n.getString());
        var o = i;
        if (0 >= o) Escort.clearRefreshTime(e);
        else {
          (e.eventContent = n.getString()),
            (e.eventID = new Array(o)),
            (e.eventButton = new Array(o));
          for (var r, s = [], l = 0; o > l; l++)
            (e.eventID[l] = n.getShort()),
              (e.eventButton[l] = n.getString()),
              (r = new MenuActionData(e.eventButton[l], e.eventID[l])),
              s.push(r);
          e.refreshTime(n.getInt(), n.getInt());
          window.__myEvent__.emit(EVENTS.ESCORT_EVENT_LIST, s);
          PanelManager.openSelectMenuPanel(
            e.eventContent,
            s,
            a,
            this,
            PopUpManager.CloseType.NONE
          );
        }
      },
      s = MsgHandler.createEscortMoveMsg(i, o);
    return (
      nato.Network.sendCmd(s, r, this), PanelManager.openWaitForServer(), !0
    );
  };

  window.AutoSell.sendToSellNoAlert = function (t: any) {
    const { PanelManager, xself, nato } = window;
    function e(t: any) {
      PanelManager.closeWaitForServer();
      var e = t.getByte();
      for (var n = "", i = 0; e > i; i++) {
        var o = (t.getInt(), t.getShort()),
          a = t.getShort(),
          r = xself.bag.getBagItemBySlotPos(a);
        null != r && (n += "\n" + r.getNameInfo() + "X" + o),
          xself.bag.removeBagItemByPos(a, o);
      }
      var s = t.getInt(),
        l = t.getInt(),
        _ = t.getInt(),
        h = t.getInt();

      xself.setPlayerMoneyValue(s, l, _);
    }

    if (null != t && 0 != t.length) {
      var n = new nato.Message(ProtocolDefine.CG_AUTO_SELL);
      n.putByte(t.length);
      for (var i = 0; i < t.length; i++) {
        var o = t[i];
        n.putInt(o.id), n.putShort(o.slotPos), n.putShort(o.quantity);
      }
      nato.Network.sendCmd(n, e, this), PanelManager.openWaitForServer();
    }
  };

  window.ItemManager.doItemNoAlert = function (e: any, n: any) {
    void 0 === n && (n = !0);
    const {
      xself,
      SafeLock,
      PanelManager,
      ForgeScene,
      Define,
      Skill,
      PetGuide,
      ItemManager,
      MountGuide,
      Enchant,
      PlayerTurnMonster,
    } = window;
    var i = xself;
    if (0 != SafeLock.doSafeLockVerify() && null != e) {
      if (e.isIdentifyScrollItem() || e.isHighIdentifyScrollItem())
        return void PanelManager.openForgeScene(ForgeScene.TAB_INDEX_IDENTIFY);
      if (e.isUpgradeIdentifyScrollItem())
        return void PanelManager.openForgeScene(ForgeScene.TAB_INDEX_IDENTIFY);
      if (e.isUpgradeIntensifyScroll())
        return void PanelManager.openForgeScene(ForgeScene.TAB_INDEX_UPSTAR);
      if (e.type == Define.ITEM_TYPE_SKILL_BOOK)
        return void Skill.doUseLearnSkillItem(e, !1, null, null);
      if (Define.POWER_NEW_GET_PET == e.power1)
        return void PetGuide.doPetGuideList(e);
      if (Define.POWER_NEW_GET_ITEM == e.power1)
        return void MountGuide.doGetMountGuideItemList(e);
      if (Define.POWER_ENCHANT_ITEM == e.power1)
        return void Enchant.doEnchantGetLists(e, !1);
      if (Define.POWER_FORMATION_BOOK == e.power1)
        return void Skill.doUseFormationBookItem(e);
      if (Define.POWER_TURN_MONSTER_CARD == e.power1)
        return void PlayerTurnMonster.doUseTurnMonsterCard(e);
      var o = ItemManager.doWorldUseItemActionNoAlert(i, e, n, null, null);
      o &&
        PanelManager.bagScene &&
        PanelManager.bagScene.stage &&
        PanelManager.bagScene.updatePanel();
    }
  };

  window.ItemManager.doWorldUseItemActionNoAlert = function (
    e: any,
    n: any,
    i: any,
    o: any,
    a: any
  ) {
    if (
      (void 0 === o && (o = null),
      void 0 === a && (a = null),
      null == e || null == n || null == e.bag)
    )
      return !1;

    const {
      Define,
      AlertPanel,
      GameText,
      Tool,
      ColorUtils,
      PowerString,
      GameText2,
    } = window;
    var r = function () {
      window.ItemManager.doWorldUseItemActionToServerNoAlert(e, n, i, o, a);
    };
    if (Define.isChangeJobItem(n.id)) {
      AlertPanel.alert(
        GameText.getText(GameText.TI_WARM_SHOW),
        Tool.manageString(
          GameText.STR_PLAYER_CHANGE_JOB_ASK,
          PowerString.makeColorString(n.name, ColorUtils.COLOR_RED)
        ),
        r,
        this
      );
    } else if (null != a && n.isPetResetItem())
      AlertPanel.alert(
        GameText.STR_ITEM_SHOW,
        Tool.manageString(GameText.STR_PET_ITEM_RESET_ASK, a.getLevel() + ""),
        r,
        this
      );
    else if (n.isChangeSexItem())
      AlertPanel.alert(
        GameText.STR_ITEM_SHOW,
        GameText2.STR_CHANGE_SEX_INFO,
        r,
        this
      );
    else {
      if (
        !(
          n.isCpPointAddItem() ||
          n.isSpPointAddItem() ||
          n.isProsperityDegreePointAddItem() ||
          n.isSkillPlayerItem() ||
          n.isSkillPetItem()
        )
      )
        return window.ItemManager.doWorldUseItemActionToServerNoAlert(
          e,
          n,
          i,
          o,
          a
        );
      AlertPanel.alert(
        GameText.STR_ITEM_SHOW,
        Tool.manageString(
          GameText2.STR_USE_ITEM_ASK,
          PowerString.makeColorString(n.name, ColorUtils.COLOR_WHITE)
        ),
        r,
        this
      );
    }
    return !1;
  };

  window.ItemManager.doWorldUseItemActionToServerNoAlert = function (
    e: any,
    n: any,
    i: any,
    o: any,
    a: any
  ) {
    const {
      Tool,
      GameWorld,
      AlertPanel,
      StringBuffer,
      GameText,
      Define,
      ItemData,
      PlayerBag,
      PanelManager,
      DrugPanel,
      ModelConst,
      MsgHandler,
      nato,
      MyPet,
      xself,
      PetDetailScene,
      PopUpManager,
      PetEquipDes,
      WorldMessage,
    } = window;

    if ((void 0 === o && (o = null), void 0 === a && (a = null), null == e))
      return !1;
    if (
      Tool.isAbleToAddHPMP(n) &&
      (GameWorld.isCountryBossStatus() ||
        GameWorld.isEscortStatus() ||
        GameWorld.isTeamBossStatus() ||
        GameWorld.isCountryWarStatus())
    )
      return AlertPanel.alertCommon("当前场景下不能使用"), !1;

    var r = e.bag;
    if (null == r) return !1;
    if (null == n) return !1;
    if (n.isNotOperate())
      return AlertPanel.alertCommon(GameText.STR_IN_SHOP_NO_USE), !1; // 摆摊
    var s = new StringBuffer(),
      l = n.slotPos,
      _ = r.getBagItemBySlotPos(l);
    if (null == _) return !1;
    var h = ItemData.isValidEquipRequire(e, _);
    if (h != Define.OK)
      return AlertPanel.alertNotify(GameText.getText(GameText.TI_ERROR), h), !1;
    if (0 == _.isCanUse(1))
      return (
        AlertPanel.alertNotify(
          GameText.getText(GameText.TI_ERROR),
          GameText.STR_CANNOT_USE_IN_WORD
        ),
        !1
      );
    if (n.isChangeNameItem()) return GameWorld.doModifyActorName(!1, l);
    var u = ProtocolDefine.BAG_NO_WAIT;
    Define.isChangeJobItem(n.id)
      ? (u = ProtocolDefine.BAG_CHANGE_JOB)
      : n.isPetEgg()
      ? (u = ProtocolDefine.BAG_USE_PET_EGG)
      : n.isChestItem()
      ? (u = ProtocolDefine.BAG_USE_CHEST)
      : n.isCountryBook()
      ? (u = ProtocolDefine.BAG_COMMAND_BOOK)
      : n.isOpenStoreItem()
      ? (u = ProtocolDefine.BAG_ADD_STORE_NUM)
      : n.isPetAddSkill()
      ? (u = ProtocolDefine.BAG_PET_ITEM_ADD_SKILLS)
      : n.isPetAgeItem()
      ? (u = ProtocolDefine.BAG_PET_AGE)
      : n.isPetResetItem()
      ? (u = ProtocolDefine.BAG_PET_RESET)
      : n.isPetExpItem()
      ? (u = ProtocolDefine.BAG_ADD_PET_EXP)
      : n.isPlayerExpItem()
      ? (u = ProtocolDefine.BAG_ADD_EXP)
      : n.isRepairItem()
      ? (u = ProtocolDefine.BAG_REPAIR)
      : n.isTitleItem()
      ? (u = ProtocolDefine.BAG_GET_TITLE)
      : n.isChangeSexItem()
      ? (u = ProtocolDefine.BAG_ALERT_SEX)
      : n.isCpPointAddItem()
      ? (u = ProtocolDefine.BAG_ADD_CP)
      : n.isSpPointAddItem()
      ? (u = ProtocolDefine.BAG_ADD_SP)
      : n.isProsperityDegreePointAddItem()
      ? (u = ProtocolDefine.BAG_ADD_PROSPERITY_DEGREE)
      : n.isSkillPlayerItem()
      ? (u = ProtocolDefine.BAG_SKILL_SLOT_PALYER)
      : n.isSkillPetItem()
      ? (u = ProtocolDefine.BAG_SKILL_SLOT_PET)
      : (n.isTimeItem() || n.isVipItem()) && (u = ProtocolDefine.BAG_WAIT);
    var c = -1;
    if ((null != o && (c = o.slotPos), n.isPetCanUseItem() && -1 == c)) {
      if (
        ((o = e.bag.getItem(PlayerBag.PET_POS)),
        (a = e.getPet()),
        null == o || null == a)
      )
        return AlertPanel.alertCommon(GameText.STR_PET_NOT_SET_FIGHT), !1;
      c = o.slotPos;
    }
    var p = 0,
      d = "",
      E = MsgHandler.createPlayerBagMessage(
        u,
        ProtocolDefine.PLAYERBAG_USE,
        n,
        c
      );
    if (u == ProtocolDefine.BAG_NO_WAIT) {
      var g = r.removeBagItemByPos(l, 1);
      if (g != Define.SUCCESS) return !1;
      PanelManager.bagScene &&
        PanelManager.bagScene.stage &&
        PanelManager.bagScene.updatePanel(),
        PanelManager.closeItemView(),
        PanelManager.isPanelShow(DrugPanel) &&
          PanelManager.getPanel(DrugPanel).update(),
        nato.Network.sendCmd(E, null, null);
    } else {
      var S = function (i: any) {
        PanelManager.closeWaitForServer();
        var h = i.getByte();
        if (0 > h) return void GameWorld.doErrorJumpShop(i, h);
        var c = r.removeBagItemByPos(l, 1);
        if (c != Define.SUCCESS) return !1;
        switch ((u = h)) {
          case ProtocolDefine.BAG_GET_TITLE:
            d = i.getString();
            break;
          case ProtocolDefine.BAG_CHANGE_JOB:
            MsgHandler.instance.processDataPlayerDetail(i, e),
              (e.skillList = MsgHandler.processDataPlayerSkillMsg(i, !0)),
              AlertPanel.alertNotify(
                "转职成功",
                Tool.manageStringU(
                  GameText.STR_PLAYER_CHANGE_SUCCEE,
                  Define.getJobString(e.getJob())
                )
              );
            break;
          case ProtocolDefine.BAG_ADD_EXP:
            MsgHandler.instance.processUpLevelMsg(i, e, s);
            break;
          case ProtocolDefine.BAG_ADD_PET_EXP:
            MsgHandler.parsePetReward(i, a, s), ItemData.fromBytesEdit(o, i);
            break;
          case ProtocolDefine.BAG_PET_ITEM_ADD_SKILLS:
            MyPet.doPetAddSkill(e, a, i, r, _, n, o);
            var E = PanelManager.getPanel(PetDetailScene, !1);
            E &&
              (E.setData(a),
              PopUpManager.removePopUp(PanelManager.getPanel(PetEquipDes, !1)));
            break;
          case ProtocolDefine.BAG_PET_RESET:
            var g = MyPet.dogetResetItemInfo(a.grow),
              S = MyPet.dogetResetItemInfo(a.compre);
            ItemData.fromBytesEdit(o, i), MyPet.fromBytesDetail(i, a);
            var m = MyPet.dogetResetItemInfo(a.grow),
              f = MyPet.dogetResetItemInfo(a.compre),
              I = r.getItemNumByID(Define.ITEM_ID_PET_RESET),
              A = Tool.manageString(GameText.STR_PET_RESET_NUM, I + "") + "\n";
            if (
              ((A +=
                Tool.manageString(
                  GameText.STR_PET_RESET_ITEM_GROW,
                  g + " --> " + m
                ) + "\n"),
              (A +=
                Tool.manageString(
                  GameText.STR_PET_RESET_ITME_COMPRE,
                  S + " --> " + f
                ) + "\n"),
              n.id == Define.ITEM_ID_PET_RESET)
            )
              MyPet.doPetUseResetItemMenu(e, a, o, A);
            else if (n.id == Define.ITEM_ID_PET_RESET2) {
              var E = PanelManager.getPanel(PetDetailScene, !1);
              E && E.setData(a);
            }
            break;
          case ProtocolDefine.BAG_PET_AGE:
            null != a &&
              ((a.ageTime = i.getLong().value + new Date().getTime()),
              AlertPanel.alertCommon(GameText.STR_PET_RESET_AGE_INFO));
            break;
          case ProtocolDefine.BAG_REPAIR:
            (p = PlayerBag.repairEquip(e, -1, !1)), xself.checkPower();
            break;
          case ProtocolDefine.BAG_COMMAND_BOOK:
            break;
          case ProtocolDefine.BAG_ADD_STORE_NUM:
            e.numStroe = i.getByte();
            break;
          case ProtocolDefine.BAG_ALERT_SEX:
            var y = i.getInt(),
              R = i.getInt(),
              P = i.getInt(),
              C = i.getByte(),
              v = i.getString();
            e.setIcon1(y),
              e.setIcon2(R),
              e.setIcon3(P),
              e.setSex(C),
              e.refreshPlayerAllSprite(),
              AlertPanel.alertCommon(v);
            break;
          case ProtocolDefine.BAG_ADD_CP:
            var M = i.getShort(),
              L = i.getString();
            (e.cp = M), AlertPanel.alertCommon(L);
            break;
          case ProtocolDefine.BAG_ADD_SP:
            var O = i.getInt(),
              N = i.getString();
            (e.sp = O), AlertPanel.alertCommon(N);
            break;
          case ProtocolDefine.BAG_ADD_PROSPERITY_DEGREE:
            var D = (i.getInt(), i.getString());
            AlertPanel.alertCommon(D);
            break;
          case ProtocolDefine.BAG_SKILL_SLOT_PALYER:
            var B = i.getString();
            AlertPanel.alertCommon(B);
            break;
          case ProtocolDefine.BAG_SKILL_SLOT_PET:
            var b = i.getString();
            AlertPanel.alertCommon(b);
            break;
          case ProtocolDefine.BAG_USE_PET_EGG:
          case ProtocolDefine.BAG_USE_CHEST:
            var x = i.getByte();
            if (0 != x) {
              var G = i.getShort(),
                U = i.getInt(),
                w = r.getItem(G);
              (null == w || w.id != U) &&
                WorldMessage.addSystemChat(
                  "checkItem.id != itemID, checkItem.id=" +
                    w.id +
                    ", -> itemID = " +
                    U
                ),
                (c = r.removeBagItemByPos(G, x)),
                c != Define.SUCCESS;
            }
            var F = MsgHandler.processAddItemMsg(
              i,
              ProtocolDefine.ADD_ITEM_USE_REWARD
            );
            s.append(F),
              u == ProtocolDefine.BAG_USE_PET_EGG &&
                window.ItemManager.doQuickEquipPet(e);
        }
        PanelManager.bagScene &&
          PanelManager.bagScene.stage &&
          PanelManager.bagScene.updatePanel(),
          PanelManager.isPanelShow(DrugPanel) &&
            PanelManager.getPanel(DrugPanel).update();
      };
      nato.Network.sendCmd(E, S, this), PanelManager.openWaitForServer();
    }
    return !0;
  };

  setupMsgHandler();
}
