'use strict'

const voids = require('html-void-elements')
const omission = require('./lib/omission')
const one = require('./lib/one')
const repeat = require('repeat-string')

module.exports = toHTML

/* Characters. */
var NULL = '\0'
var AMP = '&'
var SPACE = ' '
var TAB = '\t'
var GR = '`'
var DQ = '"'
var SQ = "'"
var EQ = '='
var LT = '<'
var GT = '>'
var SO = '/'
var LF = '\n'
var CR = '\r'
var FF = '\f'

/* https://html.spec.whatwg.org/#attribute-name-state */
var NAME = [AMP, SPACE, TAB, LF, CR, FF, SO, GT, EQ]
var CLEAN_NAME = NAME.concat(NULL, DQ, SQ, LT)

/* In safe mode, all attribute values contain DQ (`"`),
 * SQ (`'`), and GR (`` ` ``), as those can create XSS
 * issues in older browsers:
 * - https://html5sec.org/#59
 * - https://html5sec.org/#102
 * - https://html5sec.org/#108 */
var QUOTES = [DQ, SQ, GR]

/* https://html.spec.whatwg.org/#attribute-value-(unquoted)-state */
var UQ_VALUE = [AMP, SPACE, TAB, LF, CR, FF, GT]
var UQ_VALUE_CLEAN = UQ_VALUE.concat(NULL, DQ, SQ, LT, EQ, GR)

/* https://html.spec.whatwg.org/#attribute-value-(single-quoted)-state */
var SQ_VALUE = [AMP, SQ]
var SQ_VALUE_CLEAN = SQ_VALUE.concat(NULL)

/* https://html.spec.whatwg.org/#attribute-value-(double-quoted)-state */
var DQ_VALUE = [AMP, DQ]
var DQ_VALUE_CLEAN = DQ_VALUE.concat(NULL)

/* Stringify the given HAST node. */
function toHTML(node, options) {
  var settings = options || {}
  var booleanAttrMarks = settings.booleanAttrMarks || ['#'] // handle e.g #ref as boolean attribute
  var quote = settings.quote || DQ
  var customElAttrIndent = settings.customElAttrIndent || 2 // indent attributes from custom elements
  var errors = settings.allowParseErrors
  var characters = settings.allowDangerousCharacters
  var name = errors ? NAME : CLEAN_NAME
  var unquoted = errors ? UQ_VALUE : UQ_VALUE_CLEAN
  var singleQuoted = errors ? SQ_VALUE : SQ_VALUE_CLEAN
  var doubleQuoted = errors ? DQ_VALUE : DQ_VALUE_CLEAN

  if (quote !== DQ && quote !== SQ) {
    throw new Error(
      'Invalid quote `' + quote + '`, expected `' + SQ + '` or `' + DQ + '`'
    )
  }

  if (typeof customElAttrIndent === 'number') {
    customElAttrIndent = repeat(' ', customElAttrIndent)
  }

  return one(
    {
      NAME: name.concat(characters ? [] : QUOTES),
      UNQUOTED: unquoted.concat(characters ? [] : QUOTES),
      DOUBLE_QUOTED: doubleQuoted.concat(characters ? [] : QUOTES),
      SINGLE_QUOTED: singleQuoted.concat(characters ? [] : QUOTES),
      omit: settings.omitOptionalTags && omission,
      quote: quote,
      customElAttrIndent,
      booleanAttrMarks,
      unquoted: Boolean(settings.preferUnquoted),
      tight: settings.tightAttributes,
      tightLists: settings.tightCommaSeparatedLists,
      tightClose: settings.tightSelfClosing,
      dangerous: settings.allowDangerousHTML,
      voids: settings.voids || voids.concat(),
      entities: settings.entities || {},
      close: settings.closeSelfClosing
    },
    node
  )
}
