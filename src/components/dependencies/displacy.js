import constants from '../common/constants'

export default class displaCy {
    constructor(api, options) {
        this.api = api
        // this.container =
        //     typeof options.container == 'string'
        //         ? document.querySelector(options.container || '#displacy')
        //         : options.container

        this.format = 'spacy'
        this.defaultText = 'Hello World.'
        this.defaultModel = options.defaultModel || 'en'
        this.collapsePunct = options.collapsePunct !== undefined ? options.collapsePunct : true
        this.collapsePhrase = options.collapsePhrase !== undefined ? options.collapsePhrase : true

        this.onStart = options.onStart || false
        this.onSuccess = options.onSuccess || false
        this.onError = options.onError || false

        this.distance = options.distance || 150
        this.offsetX = options.offsetX || 20 // starting position of text
        this.arrowSpacing = options.arrowSpacing || 10
        this.arrowWidth = options.arrowWidth || 6 // with of arrow head
        this.arrowStroke = options.arrowStroke || 1
        this.tokenSpacing = options.tokenSpacing || 20 // space between token and arrow
        this.font = options.font || 'inherit'
        this.color = options.color || '#000000'
        this.bg = options.bg || '#ffffff'
        this.tags = options.tags || []
    }

    parse(text = this.defaultText, model = this.defaultModel, settings = {}) {
        if (typeof this.onStart === 'function') this.onStart()

        let xhr = new XMLHttpRequest()
        xhr.open('POST', this.api, true)
        xhr.setRequestHeader('Content-type', 'text/plain')
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4 && xhr.status === 200) {
                if (typeof this.onSuccess === 'function') this.onSuccess()
                this.render(JSON.parse(xhr.responseText), settings, text)
            } else if (xhr.status !== 200) {
                if (typeof this.onError === 'function') this.onError(xhr.statusText)
            }
        }

        xhr.onerror = () => {
            xhr.abort()
            if (typeof this.onError === 'function') this.onError()
        }

        xhr.send(
            JSON.stringify({
                text,
                model,
                collapse_punctuation:
                    settings.collapsePunct !== undefined
                        ? settings.collapsePunct
                        : this.collapsePunct,
                collapse_phrases:
                    settings.collapsePhrase !== undefined
                        ? settings.collapsePhrase
                        : this.collapsePhrase
            })
        )
    }

    render(parse, settings = {}, text) {
        parse = this.handleConversion(parse)

        if (text)
            console.log(
                `%c💥  JSON for "${text}"\n%c${JSON.stringify(parse)}`,
                'font: bold 16px/2 arial, sans-serif',
                'font: 13px/1.5 Consolas, "Andale Mono", Menlo, Monaco, Courier, monospace'
            )

        this.levels = [
            ...new Set(parse.dependencies.map(({ end, start }) => end - start).sort((a, b) => a - b))
        ]
        this.highestLevel = this.levels.indexOf(this.levels.slice(-1)[0]) + 1
        this.offsetY = (this.distance / 3) * this.highestLevel

        const width = this.offsetX + parse.tokens.length * this.distance
        const height = this.offsetY + 3 * this.tokenSpacing

        //this.container.innerHTML = ''
        return this._el('svg', {
            id: 'displacy-svg',
            classnames: ['displacy'],
            attributes: [
                ['width', width],
                ['height', height],
                ['viewBox', `0 0 ${width} ${height}`],
                ['preserveAspectRatio', 'xMinYMax meet'],
                ['data-format', this.format]
            ],
            style: [
                ['color', settings.color || this.color],
                ['background', settings.bg || this.bg],
                ['fontFamily', settings.font || this.font]
            ],
            children: [...this.renderWords(parse.tokens), ...this.renderArrows(parse.dependencies)]
        })
    }

    renderWords(tokens) {
        return tokens.map(({ text, tag, data = [] }, i) =>
            this._el('text', {
                classnames: ['displacy-token'],
                attributes: [
                    ['fill', 'currentColor'],
                    ['data-tag', tag],
                    ['text-anchor', 'middle'],
                    ['y', this.offsetY + this.tokenSpacing],
                    ...data.map(([attr, value]) => ['data-' + attr.replace(' ', '-'), value])
                ],
                children: [
                    this._el('tspan', {
                        classnames: ['displacy-token'],
                        attributes: [
                            ['x', this.offsetX + i * this.distance],
                            ['fill', 'currentColor'],
                            ['data-tag', tag]
                        ],
                        text: text
                    }),
                    this._el('tspan', {
                        classnames: ['displacy-tag'],
                        attributes: [
                            ['x', this.offsetX + i * this.distance],
                            ['dy', '2em'],
                            ['fill', 'currentColor'],
                            ['data-tag', tag]
                        ],
                        text: tag
                    })
                ]
            })
        )
    }

    renderArrows(dependencies) {
        const tags = this.tags
        return dependencies.map(({ label, end, start, dir, data = [] }, i) => {
            const rand = Math.random()
                .toString(36)
                .substr(2, 8)
            const level = this.levels.indexOf(end - start) + 1
            const startX =
                this.offsetX +
                start * this.distance +
                (this.arrowSpacing * (this.highestLevel - level)) / 4
            const startY = this.offsetY
            const endpoint =
                this.offsetX +
                (end - start) * this.distance +
                start * this.distance -
                (this.arrowSpacing * (this.highestLevel - level)) / 4

            let curve = this.offsetY - (level * this.distance) / 4
            if (curve == 0 && this.levels.length > 5) curve = -this.distance

            return this._el('g', {
                classnames: ['displacy-arrow'],
                attributes: [
                    ['data-dir', dir],
                    ['data-label', label],
                    ...data.map(([attr, value]) => ['data-' + attr.replace(' ', '-'), value])
                ],
                children: [
                    this._el('path', {
                        id: 'arrow-' + rand,
                        classnames: ['displacy-arc'],
                        attributes: [
                            [
                                'd',
                                `M${startX},${startY} C${startX},${curve} ${endpoint},${curve} ${endpoint},${startY}`
                            ],
                            ['stroke-width', this.arrowStroke + 'px'],
                            // ['stroke-dasharray', '5,5'],
                            ['fill', 'none'],
                            ['stroke', constants.colors[tags.indexOf(label)]],
                            ['data-dir', dir],
                            ['data-label', label]
                        ]
                    }),

                    this._el('text', {
                        attributes: [['dy', '1em']],
                        children: [
                            this._el('textPath', {
                                xlink: '#arrow-' + rand,
                                classnames: ['displacy-label'],
                                attributes: [
                                    ['startOffset', '50%'],
                                    ['fill', constants.colors[tags.indexOf(label)]],
                                    ['text-anchor', 'middle'],
                                    ['data-label', label],
                                    ['data-dir', dir]
                                ],
                                text: label
                            })
                        ]
                    }),

                    this._el('path', {
                        classnames: ['displacy-arrowhead'],
                        attributes: [
                            [
                                'd',
                                `M${dir == 'left' ? startX : endpoint},${startY + 2} L${
                                    dir == 'left'
                                        ? startX - this.arrowWidth + 2
                                        : endpoint + this.arrowWidth - 2
                                },${startY - this.arrowWidth} ${
                                    dir == 'left'
                                        ? startX + this.arrowWidth - 2
                                        : endpoint - this.arrowWidth + 2
                                },${startY - this.arrowWidth}`
                            ],
                            ['fill', constants.colors[tags.indexOf(label)]],
                            ['stroke', constants.colors[tags.indexOf(label)]],
                            ['data-label', label],
                            ['data-dir', dir]
                        ]
                    })
                ]
            })
        })
    }

    handleConversion(parse) {
        switch (this.format) {
            case 'spacy':
                return parse
                break
            case 'google':
                return {
                    tokens: parse.map(({ text: { content: text }, partOfSpeech: { tag } }) => ({
                        text,
                        tag
                    })),
                    dependencies: parse
                        .map(({ dependencyEdge: { label, headTokenIndex: j } }, i) =>
                            i !== j
                                ? {
                                      label,
                                      start: Math.min(i, j),
                                      end: Math.max(i, j),
                                      dir: j > i ? 'left' : 'right'
                                  }
                                : null
                        )
                        .filter(token => token !== null)
                }
                break
            default:
                return parse
        }
    }

    _el(tag, options) {
        const {
            classnames = [],
            attributes = [],
            style = [],
            children = [],
            text,
            id,
            xlink
        } = options
        const ns = 'http://www.w3.org/2000/svg'
        const nsx = 'http://www.w3.org/1999/xlink'
        const el = document.createElementNS(ns, tag)

        classnames.forEach(name => el.classList.add(name))
        attributes.forEach(([attr, value]) => el.setAttribute(attr, value))
        style.forEach(([prop, value]) => (el.style[prop] = value))
        if (xlink) el.setAttributeNS(nsx, 'xlink:href', xlink)
        if (text) el.appendChild(document.createTextNode(text))
        if (id) el.id = id
        children.forEach(child => el.appendChild(child))
        return el
    }
}
