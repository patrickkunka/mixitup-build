#{{name}}()

{{#if since}}
*Version added: {{since}}*
{{/if}}

{{#if syntax}}`{{syntax.code}}`{{/if}}

{{{description}}}

|   |Type | Name | Description
|---|--- | --- | ---
{{#each params}}
|Param   |`{{#each type}}{{#each this}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/each}}` | `{{#if optional}}[{{name}}]{{else}}{{name}}{{/if}}` | {{{description}}}
{{/each}}|Returns |{{#each returns}}`{{#each type}}{{#each this}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}{{/each}}` | {{{description}}}{{/each}}

{{#each this.codeExamples}}
{{#if this.caption}}##### {{{this.caption}}}{{/if}}

```js
{{{this.code}}}
```
{{/each}}