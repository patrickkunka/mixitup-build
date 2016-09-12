# {{doclet.id}}

## Overview

{{{doclet.description}}}

{{#if since}}
**Version added: {{since}}**
{{/if}}

{{#each codeExamples}}
{{#if caption}}{{caption}}{{/if}}
```js{{code}}
```{{/each}}

## Members

{{#each members}}
### <a id="{{id}}">{{memberof}}.{{name}}</a>

{{#if since}}
**Version added: {{since}}**
{{/if}}

{{#if syntax}}```js
{{syntax.code}}
```{{/if}}

{{{description}}}

{{#if isMethod}}
|   |Type | Name | Description
|---|--- | --- | ---
{{#each params}}
|Param   |`{{#each type}}{{#each this}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/each}}` | `{{#if optional}}[{{name}}]{{else}}{{name}}{{/if}}` | {{{description}}}
{{/each}}|Returns |{{#each returns}}`{{#each type}}{{#each this}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/each}}` | {{{description}}}{{/each}}
{{/if}}

{{#if isProperty}}
|Type{{#if defaultvalue}} | Default{{/if}}
|---{{#if defaultvalue}}  | ---{{/if}}
|`{{#each type.names}}{{{this}}}{{/each}}`{{#if defaultvalue}}| `{{{defaultvalue}}}`{{/if}}
{{/if}}

{{#each this.codeExamples}}
> {{#if this.caption}}{{{this.caption}}}{{/if}}
```js{{{this.code}}}
```{{/each}}
{{/each}}