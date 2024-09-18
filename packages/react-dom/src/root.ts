import { Reconciler } from 'react-reconciler';
import Renderer from './renderer';

export function createRoot(container: HTMLElement): Renderer {
	const reconciler = new Reconciler();
	const root = reconciler.createContainer(container);
	const renderer = new Renderer(root, reconciler);

	return renderer;
}
