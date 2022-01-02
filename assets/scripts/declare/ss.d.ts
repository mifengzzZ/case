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

    /** 效果信息 */
    interface Battle_spine_effect_info {
        state?: number,
        path?: string,
        offx?: number,
        offy?: number,
        maskValue?: number,
    };

    /** 技能信息 */
    interface Battle_spine_skill_info {
        /** 技能播放类型 */
        attackType: number,
        /** 技能名 */
        attackName: string,
        /** 攻击特效 */
        attackEffect: Battle_spine_effect_info,
        /** 攻击角色的位置偏移量 */
        attackRoleOff?: Battle_spine_effect_info,
        /** 击中目标效果 state: 0播放一次 1任意次 path：资源key */
        hitEffect?: Battle_spine_effect_info,
        /** 技能释放的全景效果 state: 什么时间段显示, path: 资源key */
        scene?: Battle_spine_effect_info,
        /** 技能释放的背景效果 state: 什么时间段显示, path: 资源key */
        sceneBg?: Battle_spine_effect_info,
        /** 遮罩的效果 state: 什么时间段显示, path: 透明值 */
        mask?: Battle_spine_effect_info,
    };

};