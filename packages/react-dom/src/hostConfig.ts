export type Container = Element | Document;
export type Instance = Element;
export type TextInstance = Text;

export const createTextInstance = (content: string) => {
	return document.createTextNode(content);
};

export const createInstance = (type: string) => {
	return document.createElement(type);
};

export const appendInitialChild = (parent: Instance, child: Instance) => {
	console.log('append initial child', parent, child);
	parent.appendChild(child);
};

export const appendChildToContainer = (child: Instance, parent: Container) => {
	console.log('append child to container', child, parent);
	parent.appendChild(child);
};
