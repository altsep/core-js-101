/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  return { width, height, getArea: () => width * height };
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const { constructor } = proto;
  const o = JSON.parse(json);
  const args = Object.values(o);
  return new constructor(...args);
}

/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */

const cssSelectorBuilder = {
  current: [],

  checkValidity() {
    const { caller, current } = this;
    const currentSelectors = current.map(({ type }) => type);
    const oneTimeSelectors = ['element', 'id', 'pseudoElement'];

    if (currentSelectors.indexOf(caller) !== -1 && oneTimeSelectors.indexOf(caller) !== -1) {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }

    const validOrder = ['element', 'id', 'class', 'attr', 'pseudoClass', 'pseudoElement'];
    const shouldNotFollow = validOrder.slice(validOrder.indexOf(caller) + 1);

    if (shouldNotFollow.some((v) => currentSelectors.includes(v))) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
  },

  handleSelector(value, type) {
    this.caller = type;
    this.checkValidity();
    const obj = { ...this, current: this.current.slice() };
    obj.current.push({ type, value });
    return obj;
  },

  element(value) {
    const type = 'element';
    return this.handleSelector(value, type);
  },

  id(value) {
    const type = 'id';
    return this.handleSelector(`#${value}`, type);
  },

  class(value) {
    const type = 'class';
    return this.handleSelector(`.${value}`, type);
  },

  attr(value) {
    const type = 'attr';
    return this.handleSelector(`[${value}]`, type);
  },

  pseudoClass(value) {
    const type = 'pseudoClass';
    return this.handleSelector(`:${value}`, type);
  },

  pseudoElement(value) {
    const type = 'pseudoElement';
    return this.handleSelector(`::${value}`, type);
  },

  combine({ current: current1 }, combinator, { current: current2 }) {
    const obj = { ...this };
    const combinatorObj = { type: 'combinator', value: ` ${combinator} ` };
    const arr = [...current1, combinatorObj, ...current2];
    obj.current = this.current.slice().concat(arr);
    return obj;
  },

  stringify() {
    const values = this.current.map(({ value }) => value);
    const joined = values.join('');
    return joined;
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
