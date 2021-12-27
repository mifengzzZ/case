
/**
 * 角色动画类型
 */
const SPINE_ROLE_ANIM_TYPE = {
    /**  普攻 */
    ATTACK: 'attack',
    /** 死亡 */
    DIE: 'die',
    /** 受伤 */
    HIT: 'hit',
    /** 站立 */
    IDLE: 'idle',
    /** 前冲跳跃 */
    JUMP1: 'jump1',
    /** 原地跳起 */
    JUMP2: 'jump2',
    /** 跑动 */
    RUN: 'run',
    /** 技能1 */
    SKILL1: 'skill1',
    /** 技能2 */
    SKILL2: 'skill2',
    /** 眩晕 */
    STUN: 'stun',
    /** 胜利 */
    VICTORY: 'victory',
};

/**
 * 骨骼动画监听的trackindex
 */
const SPINE_EVENT_TYPE_TRACK_INDEX = {
    /** 默认: 角色 */
    DEFAULT: 0,
    /** 开始动画结束 */
    BATTLE_START_ANIM_END: 1,
};

/**
 * 骨骼动画事件名
 */
const SPINE_EVENT_NAME = {
    /** 普通(被攻击者掉血+被攻击动作) */
    ATTACK_HIT: 'attackHit_tx',
    ATTACK_1HIT: 'attack_1Hit_tx',
};

/**
 * 击中特效播放次数类型
 */
const SPINE_HIT_EFFECT_TYPE = {
    /** 播放一次(不同阶段事件驱动掉血时机) */
    PLAYER_ONE: 0,
    /** 任意次数 */
    PLAYER_CUSTOM: 1,
};

/**
 * 攻击阶段
 */
const SPINE_ATTACK_STAGE = {
    /** 默认 */
    DEFAULT: -1,
    /** 跑动 */
    ROLE_RUN_STATE: 0,
    /** 释放攻击动画阶段 */
    ROLE_ATTACK_STATE: 1,
    /** 击中动画阶段 */
    ROLE_HIT_STATE: 2,
};

/**
 * 攻击播放类型
 */
// 近身普攻： run动画,跑到受攻击者前面->角色播放普攻动画(如果有攻击特效播放攻击特效)->(hit帧事件)角色播放击中动画(有击中特效播放击中特效)->扣血(飘字)
// 远程普攻： 播放普攻动画(如果有攻击特效播放攻击特效)->(hit帧事件)角色播放击中动画(有击中特效播放击中特效)->扣血(飘字)
// 单体近身技能：run动画,跑到受攻击者前面->角色播放技能动画(如果有攻击特效播放攻击特效)->(hit帧事件)角色播放击中动画(有击中特效播放击中特效)->扣血(飘字)
// 单体远程技能：角色播放技能动画(如果有攻击特效播放攻击特效)->(hit帧事件)角色播放击中动画(有击中特效播放击中特效)->扣血(飘字)
// 群体AOE伤害中间技能：run动画,跑到受攻击者前面->角色播放技能动画(如果有攻击特效播放攻击特效)->(hit帧事件)角色播放击中动画(有击中特效播放击中特效)->扣血(飘字)
// 群体AOE伤害远程技能：角色播放技能动画(如果有攻击特效播放攻击特效)->(hit帧事件)角色播放击中动画(有击中特效播放击中特效)->扣血(飘字)
const SPINE_BATTCK_PLAY_TYPE = {
    /** 近身普攻 */
    NEAR_ATTACK: 0,
    /** 远程普攻 */
    REMOTE_ATTACK: 1,
    /** 单体近身技能 */
    SIGN_NEAR_SKILL: 2,
    /** 单体远程技能 */
    SIGN_REMOTE_SKILL: 3,
    /** AOE中间位置释放技能 */
    AOE_CENTER_SKILL: 4,
    /** AOE远程技能 */
    AOR_REMOTE_SKILL: 5,
};


export { SPINE_ROLE_ANIM_TYPE, SPINE_EVENT_TYPE_TRACK_INDEX, SPINE_EVENT_NAME, SPINE_BATTCK_PLAY_TYPE, SPINE_HIT_EFFECT_TYPE, SPINE_ATTACK_STAGE };