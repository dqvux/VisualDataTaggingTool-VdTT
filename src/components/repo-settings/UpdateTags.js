import React from 'react'
import { Tag, Input, Tooltip, Icon, Divider, Layout, notification, Affix } from 'antd'
import constants from '../common/constants'
// import './styles/Tags.css'
import { RepositoryService } from '../database/repositoryService'

const colors = constants.colors

export default class UpdateTags extends React.Component {
    state = {
        inputVisible: false,
        inputValue: '',
    };

    handleClose = removedTag => {
        const tags = this.props.tags.filter(tag => tag !== removedTag);
        this.props._updateTagsList(tags)
    };

    showInput = () => {
        this.setState({ inputVisible: true }, () => this.input.focus());
    };

    handleInputChange = e => {
        this.setState({ inputValue: e.target.value });
    }

    handleInputConfirm = () => {
        const { inputValue } = this.state;
        let { tags } = this.props;
        if (inputValue && tags.indexOf(inputValue) === -1) {
            tags = [...tags, inputValue];
        }

        this.setState({
            inputVisible: false,
            inputValue: '',
        }, this.props._updateTagsList(tags));
    }

    saveInputRef = input => (this.input = input);

    render() {
        const { tags } = this.props
        const { inputVisible, inputValue } = this.state;
        return (
            <React.Fragment>
                {/* <Divider>Tags</Divider> */}
                {inputVisible && (
                    <Input
                        ref={this.saveInputRef}
                        className='tag'
                        type="text"
                        size="small"
                        style={{ width: 100 }}
                        value={inputValue}
                        onChange={this.handleInputChange}
                        onBlur={this.handleInputConfirm}
                        onPressEnter={this.handleInputConfirm}
                    />
                )}
                {!inputVisible && (
                    <div>
                        <Tag onClick={this.showInput} style={{ background: '#fff', borderStyle: 'dashed', marginBottom: 5 }}>
                            <Icon type="plus" /> New Tag
                        </Tag>
                        <Tag onClick={this._saveTags} style={{ background: '#fff', borderStyle: 'dashed', marginBottom: 5 }}>
                            <Icon type="save" /> Save
                        </Tag>
                    </div>
                )}
                {tags.map((tag) => {
                    const isLongTag = tag.length > 50;
                    const tagElem = (
                        <Tag className='tag cursor-pointer' color={colors[tags.indexOf(tag)]} closable={true} onClose={() => this.handleClose(tag)} onClick={() => this.props._addTag(tag)}>
                            {isLongTag ? `${tag.slice(0, 50)}...` : tag}
                        </Tag>
                    );
                    return isLongTag ? <span key={tag}><Tooltip title={tag}>{tagElem}</Tooltip></span> : <span key={tag}>{tagElem}</span>
                })}
            </React.Fragment>
        )
    }

    _saveTags = async () => {
        const { tags } = this.props
        const service = new RepositoryService()

        if (!('currentRepository' in localStorage)) {
            return
        }
        const currentRepository = JSON.parse(localStorage.getItem('currentRepository'))
        try {
            const updateds = await service.updateRepositoryById(currentRepository.id, {
                tags: tags
            })
            if (updateds > 0) {
                notification.success({ message: 'Tags has been saved successfully' })
            } else {
                notification.error({ message: 'Unable to save tags' })
            }
        } catch (ex) {
            notification.error({ message: ex.type, description: ex.message })
        }
    }
}
