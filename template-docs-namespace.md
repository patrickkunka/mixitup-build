# {{doclet.id}}

## Overview

{{{doclet.description}}}

### Contents

{{#each members}}
- {{#if isNamespace}}[{{doclet.name}}](#{{doclet.name}}){{else}}[{{name}}{{#if isMethod}}(){{/if}}](#{{name}}){{/if}}
{{/each}}

{{#if since}}
*Version added: {{since}}*
{{/if}}

{{#each members}}
{{#if isNamespace}}
<h2 id="{{doclet.name}}">{{doclet.name}}</h2>

{{{doclet.description}}}

{{#each members}}
### {{name}}{{#if isMethod}}(){{/if}}

{{#if since}}
*Version added: {{since}}*
{{/if}}

{{#if syntax}}`{{syntax.code}}`{{/if}}

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
{{#if this.caption}}###### {{{this.caption}}}{{/if}}

```js
{{{this.code}}}
```
{{/each}}
{{/each}}

{{else}}
<h3 id="{{this.name}}">{{name}}{{#if isMethod}}(){{/if}}</h3>

{{#if since}}
*Version added: {{since}}*
{{/if}}

{{#if syntax}}`{{syntax.code}}`{{/if}}

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
{{#if this.caption}}###### {{{this.caption}}}{{/if}}

```js
{{{this.code}}}
```
{{/each}}

{{/if}}
{{/each}}