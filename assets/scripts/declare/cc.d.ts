/**
 * 扩展 cc 模块 一些 creator.d.ts 未声明但实际有
 */
declare module cc {
	
	interface Node {
		_touchListener? : TouchOneByOne;
	};
	
};

declare module sp {
	interface SkeletonData {
		_skeletonCache? : SkeletonCache;
	};

	interface SkeletonCache {
		animations? : Array<spine.Animation>;
	};
};