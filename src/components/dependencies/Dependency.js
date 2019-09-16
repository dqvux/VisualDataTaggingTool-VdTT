import React from 'react'
import { Button, Icon } from 'antd'
import displaCy from './displacy'
import TaggingForm from './TaggingForm'

export default class Denpendency extends React.Component {
    state = {
        text: this.props.text,
        tags: this.props.tags,
    }
    render() {
        const { text, tags } = this.state
        console.log('in Dependency.js', text, tags)
        return (
            <React.Fragment>
                <center>
                    {
                        text && (
                            <React.Fragment>
                                <div style={{ overflowX: 'auto' }} dangerouslySetInnerHTML={{ __html: new XMLSerializer().serializeToString(new displaCy('', { tags: tags }).render(text, { color: '#000000' })) }}></div>
                                {
                                    text.dependencies.map((dependency) => {
                                        return (
                                            <TaggingForm
                                                key={dependency.key} tokens={text.tokens}
                                                dependency={dependency} tags={tags}
                                                changeDependency={this._changeDependency}
                                                removeDependency={this._removeDependency}
                                            />
                                        )
                                    })
                                }
                                <Button type="dashed" onClick={this._addDependency} style={{ width: 200, marginTop: 20 }}>
                                    <Icon type="plus" /> Add dependency
                                </Button>

                                <Button type="primary" onClick={this._save} style={{ width: 200, marginTop: 20, marginLeft: 10 }}>
                                    <Icon type="save" /> Save
                                </Button>
                            </React.Fragment>
                        )
                    }
                </center>
            </React.Fragment>
        )
    }

    _addDependency = () => {
        const currentText = this.state.text
        const newText = currentText
        newText.dependencies.push({ key: Math.random().toString(36).substr(2, 9), start: 0, end: 1, label: null, dir: null })
        this.setState({ currentText: newText })
    }

    _changeDependency = (newItem) => {
        // console.log(newItem)
        const { text } = this.state
        const indexOfUpdatedItem = text.dependencies.findIndex(item => item.key === newItem.key)
        text.dependencies.splice(indexOfUpdatedItem, 1, {
            ...text.dependencies[indexOfUpdatedItem],
            ...newItem
        })
        this.setState({ text })
    }

    _removeDependency = (key) => {
        const { text } = this.state
        const indexOfUpdatedItem = text.dependencies.findIndex(item => item.key === key)
        text.dependencies.splice(indexOfUpdatedItem, 1)
        this.setState({ text })
    }

    _save = () => {
        this.props.saveRow(this.state.text)
    }

    componentWillReceiveProps = (nextProps) => {
        this.setState({ text: nextProps.text, tags: nextProps.tags })
    }
}