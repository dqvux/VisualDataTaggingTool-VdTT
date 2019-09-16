import React from 'react'
import { Form, Icon, Input, Button, Select } from 'antd';

function hasErrors(fieldsError) {
    return Object.keys(fieldsError).some(field => fieldsError[field]);
}

class initForm extends React.Component {
    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
        })
    };

    render() {
        const { getFieldDecorator, getFieldsError } = this.props.form
        const { tokens, dependency, tags } = this.props

        return (
            <Form layout="inline" onSubmit={this.handleSubmit}>
                <Form.Item style={{ display: 'none' }}>
                    {getFieldDecorator('key', {
                        initialValue: dependency.key,
                        rules: [{ required: true, message: 'Please input your username!' }],
                    })(
                        <Input />
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('start', {
                        initialValue: dependency.start,
                        rules: [{ required: true, message: 'Please input your username!' }],
                    })(
                        <Select style={{ width: 120 }}>
                           {
                                tokens.map((token, index) => (
                                    <Select.Option key={index} value={index}>{token.text}</Select.Option>
                                ))
                           }
                       </Select>
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('end', {
                        initialValue: dependency.end,
                        rules: [{ required: true, message: 'Please input your Passtoken!' }],
                    })(
                        <Select style={{ width: 120 }}>
                            {
                                tokens.map((token, index) => (
                                    <Select.Option key={index} value={index}>{token.text}</Select.Option>
                                ))
                            }
                        </Select>
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('label', {
                        initialValue: dependency.label || undefined,
                        rules: [{ required: true, message: 'Please input your Passtoken!' }],
                    })(
                        <Select style={{ width: 120 }} placeholder='Label'>
                            {
                                tags.map((tag, index) => (
                                    <Select.Option key={index} value={tag}>{tag}</Select.Option>
                                ))
                            }
                        </Select>
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('dir', {
                        initialValue: dependency.dir || undefined,
                        rules: [{ required: true, message: 'Please input your Passtoken!' }],
                    })(
                        <Select style={{ width: 120 }} placeholder='Direction'>
                            <Select.Option value={'left'}>left</Select.Option>
                            <Select.Option value={'right'}>right</Select.Option>
                        </Select>
                    )}
                </Form.Item>
                <Form.Item>
                    <Icon
                        className="dynamic-delete-button"
                        type="minus-circle-o"
                        onClick={() => this.props.removeDependency(dependency.key)}
                    />
                </Form.Item>
            </Form>
        )
    }
}

const TaggingForm = Form.create({ name: 'horizontal_login', onValuesChange: (props, changedValues, allValues) => props.changeDependency(allValues) })(initForm)
export default TaggingForm