var parse       = require('jsdoc-parse');
var handlebars  = require('handlebars');
var path        = require('path');
var fs          = require('fs');

var DocsBuilder = function() {
    var _ = new DocsBuilder.Private();

    this.init = _.init.bind(_);

    Object.seal(this);
};

DocsBuilder.Private = function() {
    this.startTime  = -1;
    this.factory    = null;
    this.namespaces = {};
    this.subNamespaces = {};
    this.templates  = {};
    this.root       = '';
    this.hbs        = null;

    Object.seal(this);

    this.init();
};

DocsBuilder.Private.prototype = {
    constructor: DocsBuilder.Private,

    init: function() {
        var self = this;

        return Promise.resolve()
            .then(function() {
                self.root       = process.cwd();
                self.hbs        = handlebars.create();
                self.startTime  = Date.now();

                self.hbs.registerHelper('raw', function(options) {
                    return options.fn();
                });

                console.log('[MixItUp-DocsBuilder] Initialising build...');

                return self.parseScript();
            })
            .then(self.readTemplates.bind(self))
            .then(self.renderDocs.bind(self))
            .catch(console.error.bind(console));
    },

    parseScript: function() {
        var self = this;

        return new Promise(function(resolve, reject) {
            var input = '';

            parse({
                src: './dist/' + DocsBuilder.getParameter('-s')
            })
                .on('data', function(data) {
                    input += data;
                })
                .on('end', function() {
                    resolve(input);
                })
                .on('error', reject);
        })
            .then(self.sortDoclets.bind(self));
    },

    sortDoclets: function(input) {
        var self    = this,
            doclets = JSON.parse(input);

        doclets.forEach(function(doclet) {
            if (doclet.kind === 'namespace') {
                if (doclet.memberof === 'mixitup') {
                    self.namespaces[doclet.id] = new DocsBuilder.Namespace(doclet);
                } else {
                    self.subNamespaces[doclet.id] = new DocsBuilder.Namespace(doclet);
                }
            }
        });

        doclets.forEach(function(doclet) {
            var parentNamespace = null,
                model           = new DocsBuilder.Doclet();

            if (doclet.kind === 'namespace' && typeof (parentNamespace = self.namespaces[doclet.memberof]) !== 'undefined') {
                // Nested namespace

                parentNamespace.members.push(self.subNamespaces[doclet.id]);
            } else if (
                doclet.memberof &&
                typeof (parentNamespace = (self.namespaces[doclet.memberof] || self.subNamespaces[doclet.memberof])) !== 'undefined'
            ) {
                // Member or Method

                Object.assign(model, doclet);

                if (doclet.examples) {
                    model.examples = self.parseExamples(doclet.examples);
                }

                parentNamespace.members.push(model);
            } else if (doclet.scope === 'global') {
                // Factory

                Object.assign(model, doclet);

                self.factory = model;

                if (doclet.examples) {
                    model.examples = self.parseExamples(doclet.examples);
                }
            }
        });
    },

    /**
     * @param   {string[]} examples
     * @return  {DocsBuilder.Example[]}
     */

    parseExamples: function(examples) {
        var re      = /<caption>([^<]+)<\/caption>\n/g,
            example = null,
            capture = null,
            output  = [],
            caption = '',
            code    = '',
            i       = -1;

        for (i = 0; i < examples.length; i++) {
            code = examples[i];

            capture = re.exec(code);
            caption = capture ? capture[1] : '';
            code    = code.replace(re, '');
            code    = code.replace(/&lt;/g, '<');
            code    = code.replace(/&gt;/g, '>');
            example = new DocsBuilder.Example();

            example.caption = caption;
            example.code    = code;

            output.push(example);

            re.lastIndex = 0;
        }

        return output;
    },

    readTemplates: function() {
        var self        = this,
            dirPath     = __dirname,
            fileNames   = [];

        return new Promise(function(resolve, reject) {
            fs.stat(dirPath, function(err, stat) {
                if (err) reject(err);

                resolve(stat);
            });
        })
            .then(function(exists) {
                if (!exists) return [];

                return new Promise(function(resolve, reject) {
                    fs.readdir(dirPath, function(err, list) {
                        if (err) reject(err);

                        resolve(list);
                    });
                });
            })
            .then(function(list) {
                var filtered = list.filter(function(fileName) {
                    return fileName.charAt(0) !== '.' && fileName.indexOf('.md') > -1;
                });

                return filtered;
            })
            .then(function(filtered) {
                var tasks = [];

                fileNames = filtered;

                fileNames.forEach(function(fileName) {
                    var filePath = path.join(dirPath, fileName);

                    tasks.push(new Promise(function(resolve, reject) {
                        fs.readFile(filePath, function(err, data) {
                            if (err) reject;

                            resolve(data);
                        });
                    }));
                });

                return Promise.all(tasks);
            })
            .then(function(buffers) {
                buffers.forEach(function(buffer, i) {
                    var slug = fileNames[i].replace('.md', '');

                    self.templates[slug] = self.hbs.compile(buffer.toString());
                });
            });
    },

    renderDocs: function() {
        var self            = this,
            factoryOutput   = '',
            factoryPath     = '',
            totalFiles      = 0,
            tasks           = [];

        Object.keys(self.namespaces).forEach(function(key) {
            var namespace   = self.namespaces[key],
                filePath    = path.join(self.root, 'docs', key + '.md'),
                output      = '';

            output = self.templates['template-docs-namespace'](namespace);

            totalFiles++;

            tasks.push(new Promise(function(resolve) {
                fs.writeFile(filePath, output, resolve);
            }));
        });

        factoryOutput   = self.templates['template-docs-factory'](self.factory);
        factoryPath     = path.join(self.root, 'docs', 'mixitup.md');

        totalFiles++;

        tasks.push(new Promise(function(resolve) {
            fs.writeFile(factoryPath, factoryOutput, resolve);
        }));

        return Promise.all(tasks)
            .then(function() {
                var duration = Date.now() - self.startTime;

                console.log('[MixItUp-DocsBuilder] ' + totalFiles + ' documentation files generated in ' + duration + 'ms');
            });
    }
};

/**
 * @static
 * @param   {string}    param
 * @return  {string}
 */

DocsBuilder.getParameter = function(param) {
    var params      = process.argv,
        paramIndex  = -1,
        value       = '';

    paramIndex = params.indexOf(param);

    if (paramIndex > -1) {
        value = params[paramIndex + 1];
    }

    return value || '';
};

DocsBuilder.Namespace = function(doclet) {
    this.doclet         = doclet;
    this.members        = [];
    this.isNamespace    = true;

    Object.seal(this);
};

DocsBuilder.Example = function() {
    this.caption     = '';
    this.code        = '';

    Object.seal(this);
};

DocsBuilder.Doclet = function() {
    this.id             = '';
    this.name           = '';
    this.access         = '';
    this.longname       = '';
    this.scope          = '';
    this.kind           = '';
    this.description    = '';
    this.memberof       = '';
    this.since          = '';
    this.order          = -1;
    this.type           = '';
    this.meta           = {};
    this.defaultvalue   = [];
    this.params         = [];
    this.returns        = [];
    this.examples       = [];

    Object.defineProperties(this, {
        isFactory: {
            get: function() {
                return this.kind === 'function' && !this.memberof;
            }
        },
        isMethod: {
            get: function() {
                return this.kind === 'function' && this.memberof;
            }
        },
        isProperty: {
            get: function() {
                return this.kind === 'member';
            }
        },
        syntax: {
            get: function() {
                if (this.isMethod || this.isFactory) {
                    return this.examples[0];
                }
            }
        },
        codeExamples: {
            get: function() {
                if (this.isMethod || this.isFactory) {
                    return this.examples.slice(1);
                } else {
                    return this.examples;
                }
            }
        }
    });
};

module.exports = new DocsBuilder();