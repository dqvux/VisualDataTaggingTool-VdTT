import React from 'react'
import { Form, Icon, Input, Button, Select } from 'antd'

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class initForm extends React.Component {
    componentDidMount() {
        // To disabled submit button at the beginning.
        this.props.form.validateFields();
    }

    render() {
        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form;

        // Only show error after a field is touched.
        const nameError = isFieldTouched('name') && getFieldError('name');
        const typeError = isFieldTouched('type') && getFieldError('type');
        const descriptionError = isFieldTouched('description') && getFieldError('description');
        return (
            <Form onSubmit={this._addRepository}>
                <Form.Item validateStatus={nameError ? 'error' : ''} help={nameError || ''}>
                    {getFieldDecorator('name', {
                        rules: [{ required: true, message: 'Please input your repository name!' }],
                    })(
                        <Input
                            style={{ width: '100%' }}
                            prefix={<Icon type="snippets" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Repository name"
                        />,
                    )}
                </Form.Item>
                <Form.Item validateStatus={typeError ? 'error' : ''} help={typeError || ''}>
                    {getFieldDecorator('type', {
                        rules: [{ required: true, message: 'Please choose a type!' }],
                    })(
                        <Select placeholder="Choose a type" style={{ width: '100%' }}>
                            {/* prefix={<Icon type="edit" style={{ color: 'rgba(0,0,0,.25)' }} />} */}
                            <Select.Option value='Named Entities'>Named Entities</Select.Option>
                            <Select.Option value='Text Classification'>Text Classification</Select.Option>
                            <Select.Option value='Dependencies'>Dependencies</Select.Option>
                            <Select.Option value='POS Tagging'>POS Tagging</Select.Option>
                            <Select.Option value='DiAML Tagging'>Dialogue Makeup language</Select.Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item validateStatus={descriptionError ? 'error' : ''} help={descriptionError || ''}>
                    {getFieldDecorator('description', {
                        rules: [{ required: true, message: 'Please input your description!' }],
                    })(
                        <Input.TextArea
                            style={{ width: '100%' }}
                            prefix={<Icon type="edit" style={{ color: 'rgba(0,0,0,.25)' }} />}
                            placeholder="Description"
                        />,
                    )}
                </Form.Item>
                
                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        disabled={hasErrors(getFieldsError())}
                        icon='plus'
                    >
                        Repository
                </Button>
                </Form.Item>
            </Form>
        );
    }

    _addRepository = (e) => {
        e.preventDefault()
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values)
                values.data = []
                values.tags = []
                values.settings = { tokenDelimiter: 'space' }
                values.createdAt = new Date()
                //console.log(values)
                this.props._addRepository(values)
            }
        })
    }
}

const CreateRepositoryForm = Form.create({ name: 'create-repo-form' })(initForm)

export default CreateRepositoryForm
