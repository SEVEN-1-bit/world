import { IConfiguration } from "common/configuration";
import EventEmitter from "events";
import fs from "fs";



const defaultConfigurtion: IConfiguration = {
  version: "天宇", // 天宇
  accounts: [],
  app: {
    autoOnline: false,
    autoSellByBagWillFull: false,
    autoRepairEquip: false,
    repairRoll: false,
    autoExpandBag: false,
    sell_buildMaterial: false,
    sell_RareEquip: false,
  },
  oaccounts: [],
  list: {
    black: ["豹皮", "腐鹰羽毛", "月狼之石"],
    white: [],
    equipWhite: [".护符$", ".书."],
  },
};

export default class Configuration extends EventEmitter {
  configuration!: IConfiguration;

  constructor(private configurationPath: string) {
    super();
    this.load();
  }

  load() {
    if (!this.isExist()) {
      this.create();
    }

    try {
      this.configuration = JSON.parse(
        fs.readFileSync(this.configurationPath, "utf-8")
      );
    } catch (error) {
      this.configuration = defaultConfigurtion;
    }
  }

  create() {
    fs.writeFileSync(
      this.configurationPath,
      JSON.stringify(defaultConfigurtion),
      {
        flag: "w+",
      }
    );
  }

  save() {
    fs.writeFileSync(
      this.configurationPath,
      JSON.stringify(this.configuration || defaultConfigurtion),
      {
        flag: "w+",
      }
    );

    this.emit("saved");
  }

  isExist() {
    return fs.existsSync(this.configurationPath);
  }
}
