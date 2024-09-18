export interface HostConfig {
	createTextInstance: (content: string) => any;
	createInstance: (_type: string) => any;
	appendInitialChild: (parent: any, child: any) => any;
	appendChildToContainer: (child: any, parent: any) => any;
}

export * from 'react-dom/src/hostConfig';
