import { isDocument } from '../core/util/element';
import { getValidManifest } from '../optimizer/src/manifest';
import type { SerializeDocumentOptions } from './types';

/**
 * Serializes the given `document` to a string. Additionally, will serialize the
 * Qwik component state and optionally add Qwik protocols to the document.
 * @public
 */
export function serializeDocument(docOrEl: Document | Element, opts?: SerializeDocumentOptions) {
  if (!isDocument(docOrEl)) {
    return docOrEl.outerHTML;
  }

  const manifest = getValidManifest(opts?.manifest);
  if (manifest && Array.isArray(manifest.injections)) {
    for (const injection of manifest.injections) {
      const el = docOrEl.createElement(injection.tag);
      if (injection.attributes) {
        Object.entries(injection.attributes).forEach(([attr, value]) => {
          el.setAttribute(attr, value);
        });
      }
      if (injection.children) {
        el.textContent = injection.children;
      }
      const parent = injection.location === 'head' ? docOrEl.head : docOrEl.body;
      parent.appendChild(el);
    }
  }

  return DOCTYPE + docOrEl.documentElement.outerHTML;
}


export function splitDocument(docOrEl: Document | Element, opts?: SerializeDocumentOptions): [string, string] {

  const html = serializeDocument(docOrEl, opts);
  let start = 0;
  let end = html.length;
  if (html.startsWith(DOCTYPE)) {
    start = DOCTYPE.length;
  }
  const bodyIndex = html.lastIndexOf('</body>');
  if (bodyIndex >= 0) {
    end = bodyIndex;
  } else {
    const lastClosingTag = html.lastIndexOf('</');
    if (lastClosingTag >= 0) {
      end = lastClosingTag;
    }
  }
  return [
    html.slice(start, end),
    html.slice(end)
  ];
}

const DOCTYPE = '<!DOCTYPE html>';