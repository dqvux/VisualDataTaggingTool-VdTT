import React from 'react'
import { Form, Icon, Input, Button, Select, Modal, notification } from 'antd'
import { RepositoryService } from '../database/repositoryService'

const formItemLayout = {
    labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
    },
    wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
    },
}

const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 16,
            offset: 8,
        },
    },
}

class initForm extends React.Component {
    render() {
        const { repository } = this.props
        const { getFieldDecorator } = this.props.form;
        return (
            <Form {...formItemLayout} onSubmit={this._updateRepository}>
                <Form.Item label='Repository name'>
                    {getFieldDecorator('name', {
                        initialValue: repository.name,
                        rules: [{ required: true, message: 'Please input your repository name!' }],
                    })(
                        <Input
                            style={{ width: '100%' }}
                            prefix={<Icon type="snippets" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Repository name"
                        />,
                    )}
                </Form.Item>
                <Form.Item label='Repository type'>
                    {getFieldDecorator('type', {
                        initialValue: repository.type,
                        rules: [{ required: true, message: 'Please choose a type!' }],
                    })(
                        <Select placeholder="Choose a type" style={{ width: '100%' }} disabled>
                            <Select.Option value='Named Entities'>Named Entities</Select.Option>
                            <Select.Option value='Text Classification'>Text Classification</Select.Option>
                            <Select.Option value='Dependencies'>Dependencies</Select.Option>
                            <Select.Option value='POS Tagging'>POS Tagging</Select.Option>
                            <Select.Option value='DiAML Tagging'>Dialogue Makeup language</Select.Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item label='Description'>
                    {getFieldDecorator('description', {
                        initialValue: repository.description,
                        rules: [{ required: true, message: 'Please input your description!' }],
                    })(
                        <Input.TextArea
                            style={{ width: '100%' }}
                            prefix={<Icon type="edit" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Description"
                        />,
                    )}
                </Form.Item>
                <Form.Item label='Token delimiter'>
                    {getFieldDecorator('settings.tokenDelimiter', {
                        initialValue: repository.settings.tokenDelimiter,
                        rules: [{ required: true, message: 'Please input your description!' }],
                    })(
                        <Select placeholder="Choose a tokenizer" style={{ width: '100%' }}>
                            <Select.Option value='space'>Space</Select.Option>
                            <Select.Option value='empty_string'>Empty String</Select.Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit" icon='save'>Save</Button>
                    {' '}
                    <Button type='danger' icon='delete' onClick={this._showDeleteConfirm}>Delete this repository</Button>
                </Form.Item>
            </Form>
        );
    }

    _updateRepository = (e) => {
        e.preventDefault()
        const { repository } = this.props
        this.props.form.validateFields(async (err, values) => {
            if (!err) {
                // console.log('Received values of form: ', values)
                values.id = repository.id
                values.tags = repository.tags
                const service = new RepositoryService()
                try {
                    await service.updateRepositoryById(repository.id, {
                        name: values.name,
                        description: values.description,
                        settings: values.settings,
                    })
                    localStorage.setItem('currentRepository', JSON.stringify(values))
                    notification.success({ message: <span>Your repository <b>"{repository.name}"</b> was successfully updated.</span> })
                    window.location.reload()
                } catch (ex) {
                    notification.error({ message: ex.type, description: ex.message })
                }
            }
        })
    }

    _removeRepository = async () => {
        const { repository } = this.props
        const service = new RepositoryService()
        try {
            const removeRepositorys = await service.removeRepository(repository.id)
            if (removeRepositorys > 0) {
                localStorage.removeItem('currentRepository')
                notification.success({ message: 'Removed repository successful' })
                window.location.reload()
            } else {
                notification.error({ message: 'Unable to remove repository' })
            }
        } catch (ex) {
            notification.error({ message: ex.type, description: ex.message })
        }
    }

    _showDeleteConfirm = () => {
        const { repository } = this.props
        const that = this
        Modal.confirm({
            title: <span>Are you sure delele?</span>,
            content: <p>This action cannot be <b>undone</b>. This will permanently delete the <b>{repository.name}</b> repository data. You should download a backup file.</p>,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk() {
                that._removeRepository()
            },
            onCancel() {
                console.log('Cancel');
            },
        })
    }
}

const UpdateRepoSettings = Form.create({ name: 'update-repo-form' })(initForm)

export default UpdateRepoSettings
