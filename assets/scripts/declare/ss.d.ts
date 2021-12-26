/**
 * 该工程类型声明
 */
declare namespace ss {

    /** 战斗骨骼帧数据类型 */
    interface Battle_spine_frame {
        /** 攻击者位置 */
        attackindex: Array<number>,
        /** 被攻击者位置列表 */
        bAttackindexList: Array<number>;
        /** 增益效果列表 */
        buf?: Array<Object>,
        /** 减益效果列表 */
        debuf?: Array<Object>,
        /** 技能释放流程信息 */
        skill: Battle_spine_skill_info,
    };

    /** 技能信息 */
    interface Battle_spine_skill_info {
        /** 技能播放类型 */
        actType: number,
        /** 技能名: attack skill1 skill2 */
        act?: string,
        /** 攻击特效 */
        attackEffect?: string,
        /** 击中目标效果 */
        hitEffect?: string,
        /** 技能释放的全景效果 */
        sceneEffect?: string,
        /** 技能释放的背景效果 */
        sceneBgEffect?: string,
    };

};