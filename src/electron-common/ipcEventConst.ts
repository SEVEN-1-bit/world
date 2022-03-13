/** @description 渲染进程 */
export const enum IPCR {
  INITALIZED = 'initalized',
  UNINITALIZE = 'uninitalize',

  SELL_PRODUCT = "sell:product",
  REPAIR_EQUIP = 'repair:equip',
  REPAIR_EQUIP_IN_CITY = "repair:equip:in:city",
  REPAIR_EQUIP_IN_MAP = "repair:equip:in:map",
  OPEN_DAILY_BOX = "open:daily:box",

  AUTO_REPAIR_EQUIP = "auto:repair:equip",
  AUTO_ONE_DAILY_MISSION = "auto:daliy:mission",
  AUTO_ONE_DAILY_SELL = "auto:daily:sell",
  AUTO_REFRESH_MONSTER = "auto:refresh:monster",
  AUTO_EXPAND_BAG = "auto:expand:bag",
  AUTO_ONLINE_REWARD = "auto:online:reward",

  MICRO_REWARD = "micro:reward",

  GET_VERSION_URL = "get:version:url",
  GET_IS_AUTO_DAILY = "get:auto:daily",
  GET_IS_GAME_STARTED = "get:game:started",
  GET_IS_REFRESH_MONSTER = "get:refresh:monster",
  GET_ACCOUNTS = "get:accounts",

  SET_USE_REPAIR_ROLL = "set:repair:roll",
  SET_SELL_OPTIONS = 'set:sell:options',

  INVOKE_VERSION_INFO = "invoke:version:info",
}

// receive
/** @description 主进程 */
export const enum IPCM {
  INITALIZED = 'initalized',
  UNINITALIZE = 'uninitalize',

  RECEIVE_VERSION_URL = "receive:version:url",
  RECEIVE_IS_AUTO_DAILY = "receive:auto:daily",
  RECEIVE_IS_GAME_STARTED = "receive:game:started",
  RECEIVE_IS_REFESH_MONSTER = "receive:refresh:monster",

  RECEIVE_ACCOUNTS = "receive:accounts",

  GAME_WILL_READY = "game:will:ready",

  INVOKE_VERSION_INFO = "invoke:version:info",
  HANDLE_VERSION_INFO = "handle:version:info",

  SETUP_FUNCTION_STARTED = 'setup:function:started',
  SETUP_FUNCTION_ENDED = 'setup:function:ended',

  GAME_HOOK_STARTED = 'game:hook:started',
  GAME_HOOK_ENDED = 'game:hook:ended',

  MOUSE_WHEEL = 'mouse:wheel',
}
