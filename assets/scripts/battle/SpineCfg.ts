
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
 * 战斗攻击播放流程类型
 */
const SPINE_BATTLE_PLAY_TYPE = {
    /** 近身普攻攻击流程: 冲向对面->攻击者播放普攻动画(如果有特效加上)->受伤者击中动画(击中特效)+掉血 */
    ATTACK: 0,
    /** 近身全屏技能(只有攻击者与受攻击者出现在屏幕中) */
    NEAR_SCENE_SKILL: 1,
    /** 原地全屏技能(aoe伤害,只有攻击者与受攻击者出现在屏幕中) */
    INSITU_SCENE_SKILL: 2,
    /** 站在我方与敌方英雄中间释放全屏技能 */
    CENTER_SCENE_SKILL: 3,
};


export { SPINE_ROLE_ANIM_TYPE, SPINE_EVENT_TYPE_TRACK_INDEX, SPINE_EVENT_NAME, SPINE_BATTLE_PLAY_TYPE };