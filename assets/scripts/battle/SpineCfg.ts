
/**
 * 角色动画类型
 */
const SPINE_ROLE_ANIM_TYPE = {
    ATTACK : 'attack',     // 普攻
    DIE : 'die', // 死亡
    HIT : 'hit', // 受伤
    IDLE : 'idle', // 站立
    JUMP1 : 'jump1', // 前冲跳跃
    JUMP2 : 'jump2', // 原地跳起
    RUN : 'run', // 跑动
    SKILL1 : 'skill1', // 技能1
    SKILL2 : 'skill2', // 技能2
    STUN : 'stun', // 眩晕
    VICTORY : 'victory', // 胜利
};

/**
 * 骨骼动画监听的trackindex
 */
const SPINE_EVENT_TYPE_TRACK_INDEX = {
    /** 默认 */
    DEFAULT: 0,
    /** 开始动画结束 */
    BATTLE_START_ANIM_END: 1,
};

/**
 * 骨骼动画事件名
 */
const SPINE_EVENT_NAME = {
    /** 普通(被攻击者掉血+被攻击动作) */
    ATTACK_HIT : 'attackHit_tx'
};

/**
 * 战斗攻击播放流程类型
 */
const SPINE_BATTLE_PLAY_TYPE = {
    /** 普攻流程: 攻击者播放释放动画(如果有特效,特效也加上)->击中动画(击中特效)->掉血 */
    ATTACK : 0,
};


export { SPINE_ROLE_ANIM_TYPE, SPINE_EVENT_TYPE_TRACK_INDEX, SPINE_EVENT_NAME, SPINE_BATTLE_PLAY_TYPE };