import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, Steps, Button, Form, Input, Select, DatePicker, ColorPicker, Switch, Divider, Space, Typography, Checkbox, Radio, Upload, Slider, Collapse, message, Modal, Timeline } from 'antd';
import styled from 'styled-components';
import FormElement from '../components/FormElements';
import FormDropZone from '../components/FormDropZone';
import FormBuilderService from '../services/FormBuilderService';
import { 
  SaveOutlined, 
  UndoOutlined, 
  RedoOutlined, 
  DeleteOutlined,
  CopyOutlined,
  DragOutlined,
  EyeOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  PlusOutlined,
  MinusOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SwapOutlined,
  LockOutlined,
  UnlockOutlined,
  EditOutlined,
  CheckOutlined,
  CloseOutlined,
  DesktopOutlined,
  MobileOutlined,
  InboxOutlined
} from '@ant-design/icons';

const { Step } = Steps;
const { Option } = Select;
const { Title, Text } = Typography;
const { Panel } = Collapse;

const BuilderContainer = styled.div`
  display: flex;
  height: calc(100vh - 64px);
  padding: 20px;
  gap: 20px;
`;

const Sidebar = styled.div`
  width: 300px;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  overflow-y: auto;
  max-height: calc(100vh - 100px);
`;

const BuilderArea = styled.div`
  flex: 1;
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-height: 500px;
  overflow-y: auto;
`;

const FormPreview = styled.div`
  background: ${props => props.themeColor || '#fff'};
  padding: 24px;
  border-radius: 8px;
  min-height: 400px;
  color: ${props => props.textColor || '#000'};
  font-family: ${props => props.fontFamily || 'inherit'};
`;

const FontPreview = styled.div`
  padding: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  margin-top: 8px;
  text-align: center;
  font-family: ${props => props.fontFamily || 'inherit'};
  font-weight: ${props => props.fontWeight || 'normal'};
  font-size: ${props => props.fontSize || '16px'};
  color: ${props => props.textColor || '#000'};
`;

const FormBuilder = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [formState, setFormState] = useState(FormBuilderService.getFormState());
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isMobilePreview, setIsMobilePreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showDuplicate, setShowDuplicate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [showRedo, setShowRedo] = useState(false);
  const [showLock, setShowLock] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showCheck, setShowCheck] = useState(false);
  const [showClose, setShowClose] = useState(false);
  const [showArrowLeft, setShowArrowLeft] = useState(false);
  const [showArrowRight, setShowArrowRight] = useState(false);
  const [showSwap, setShowSwap] = useState(false);
  const [showPlus, setShowPlus] = useState(false);
  const [showMinus, setShowMinus] = useState(false);
  const [showDrag, setShowDrag] = useState(false);
  const [showEye, setShowEye] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [showShareAlt, setShowShareAlt] = useState(false);
  const [showSetting, setShowSetting] = useState(false);
  const [showQuestionCircle, setShowQuestionCircle] = useState(false);

  useEffect(() => {
    form.setFieldsValue({
      formName: formState.name,
      formDescription: formState.description,
      marketingPixel: formState.marketingPixel
    });
  }, [formState, form]);

  const handleSettingsChange = (settings) => {
    const newState = FormBuilderService.updateFormSettings(settings);
    setFormState(newState);
  };

  const handleAddPage = () => {
    const newState = FormBuilderService.addPage();
    setFormState(newState);
  };

  const handlePageChange = (pageIndex) => {
    const newState = FormBuilderService.setCurrentPage(pageIndex);
    setFormState(newState);
  };

  const handleDrop = (item) => {
    const newState = FormBuilderService.addFormElement(item);
    setFormState(newState);
  };

  const handleElementUpdate = (pageIndex, elementIndex, updates) => {
    const newState = FormBuilderService.updateFormElement(pageIndex, elementIndex, updates);
    setFormState(newState);
  };

  const handleElementRemove = (pageIndex, elementIndex) => {
    const newState = FormBuilderService.removeFormElement(pageIndex, elementIndex);
    setFormState(newState);
  };

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  const handleMobilePreview = () => {
    setIsMobilePreview(!isMobilePreview);
  };

  const handleHelp = () => {
    setShowHelp(!showHelp);
  };

  const handleSettings = () => {
    setShowSettings(!showSettings);
  };

  const handleTemplates = () => {
    setShowTemplates(!showTemplates);
  };

  const handleHistory = () => {
    setShowHistory(!showHistory);
  };

  const handleShare = () => {
    setShowShare(!showShare);
  };

  const handleExport = () => {
    setShowExport(!showExport);
  };

  const handleImport = () => {
    setShowImport(!showImport);
  };

  const handleDuplicate = () => {
    setShowDuplicate(!showDuplicate);
  };

  const handleDelete = () => {
    setShowDelete(!showDelete);
  };

  const handleUndo = () => {
    setShowUndo(!showUndo);
  };

  const handleRedo = () => {
    setShowRedo(!showRedo);
  };

  const handleLock = () => {
    setShowLock(!showLock);
  };

  const handleUnlock = () => {
    setShowUnlock(!showUnlock);
  };

  const handleEdit = () => {
    setShowEdit(!showEdit);
  };

  const handleCheck = () => {
    setShowCheck(!showCheck);
  };

  const handleClose = () => {
    setShowClose(!showClose);
  };

  const handleArrowLeft = () => {
    setShowArrowLeft(!showArrowLeft);
  };

  const handleArrowRight = () => {
    setShowArrowRight(!showArrowRight);
  };

  const handleSwap = () => {
    setShowSwap(!showSwap);
  };

  const handlePlus = () => {
    setShowPlus(!showPlus);
  };

  const handleMinus = () => {
    setShowMinus(!showMinus);
  };

  const handleDrag = () => {
    setShowDrag(!showDrag);
  };

  const handleEye = () => {
    setShowEye(!showEye);
  };

  const handlePreviewIcon = () => {
    setShowPreview(!showPreview);
  };

  const handleDownload = () => {
    setShowDownload(!showDownload);
  };

  const handleShareAlt = () => {
    setShowShareAlt(!showShareAlt);
  };

  const handleSetting = () => {
    setShowSetting(!showSetting);
  };

  const handleQuestionCircle = () => {
    setShowQuestionCircle(!showQuestionCircle);
  };

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('Form values:', values);
      console.log('Form state:', formState);
      message.success('Form saved successfully!');
    });
  };

  const steps = [
    {
      title: 'Basic Information',
      content: (
        <Form form={form} layout="vertical">
          <Form.Item 
            name="formName" 
            label="Form Name" 
            rules={[{ required: true }]}
            initialValue={formState.name}
          >
            <Input onChange={(e) => handleSettingsChange({ name: e.target.value })} />
          </Form.Item>
          <Form.Item 
            name="formDescription" 
            label="Description"
            initialValue={formState.description}
          >
            <Input.TextArea onChange={(e) => handleSettingsChange({ description: e.target.value })} />
          </Form.Item>
          <Form.Item 
            name="isMultiPage" 
            label="Multi-page Form" 
            valuePropName="checked"
            initialValue={formState.isMultiPage}
          >
            <Switch onChange={(checked) => handleSettingsChange({ isMultiPage: checked })} />
          </Form.Item>
        </Form>
      ),
    },
    {
      title: 'Form Builder',
      content: (
        <div>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Button type="primary" icon={<SaveOutlined />} onClick={handleSubmit}>
                Save
              </Button>
              <Button icon={<UndoOutlined />} onClick={handleUndo} style={{ marginLeft: 8 }}>
                Undo
              </Button>
              <Button icon={<RedoOutlined />} onClick={handleRedo} style={{ marginLeft: 8 }}>
                Redo
              </Button>
              <Button icon={<DeleteOutlined />} onClick={handleDelete} style={{ marginLeft: 8 }}>
                Delete
              </Button>
              <Button icon={<CopyOutlined />} onClick={handleDuplicate} style={{ marginLeft: 8 }}>
                Duplicate
              </Button>
              <Button icon={<DragOutlined />} onClick={handleDrag} style={{ marginLeft: 8 }}>
                Drag
              </Button>
              <Button icon={<EyeOutlined />} onClick={handleEye} style={{ marginLeft: 8 }}>
                Eye
              </Button>
              <Button icon={<EyeOutlined />} onClick={handlePreviewIcon} style={{ marginLeft: 8 }}>
                Preview
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleDownload} style={{ marginLeft: 8 }}>
                Download
              </Button>
              <Button icon={<ShareAltOutlined />} onClick={handleShareAlt} style={{ marginLeft: 8 }}>
                Share
              </Button>
              <Button icon={<SettingOutlined />} onClick={handleSetting} style={{ marginLeft: 8 }}>
                Settings
              </Button>
              <Button icon={<QuestionCircleOutlined />} onClick={handleQuestionCircle} style={{ marginLeft: 8 }}>
                Help
              </Button>
              <Button icon={<PlusOutlined />} onClick={handlePlus} style={{ marginLeft: 8 }}>
                Add
              </Button>
              <Button icon={<MinusOutlined />} onClick={handleMinus} style={{ marginLeft: 8 }}>
                Remove
              </Button>
              <Button icon={<ArrowLeftOutlined />} onClick={handleArrowLeft} style={{ marginLeft: 8 }}>
                Previous
              </Button>
              <Button icon={<ArrowRightOutlined />} onClick={handleArrowRight} style={{ marginLeft: 8 }}>
                Next
              </Button>
              <Button icon={<SwapOutlined />} onClick={handleSwap} style={{ marginLeft: 8 }}>
                Swap
              </Button>
              <Button icon={<LockOutlined />} onClick={handleLock} style={{ marginLeft: 8 }}>
                Lock
              </Button>
              <Button icon={<UnlockOutlined />} onClick={handleUnlock} style={{ marginLeft: 8 }}>
                Unlock
              </Button>
              <Button icon={<EditOutlined />} onClick={handleEdit} style={{ marginLeft: 8 }}>
                Edit
              </Button>
              <Button icon={<CheckOutlined />} onClick={handleCheck} style={{ marginLeft: 8 }}>
                Check
              </Button>
              <Button icon={<CloseOutlined />} onClick={handleClose} style={{ marginLeft: 8 }}>
                Close
              </Button>
            </div>
          </div>

          <BuilderContainer>
            <Sidebar>
              <Collapse defaultActiveKey={['1', '2', '3', '4', '5', '6', '7', '8']}>
                <Panel header="Form Settings" key="1">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name="formWidth" label="Form Width">
                      <Input 
                        value={formState.formWidth}
                        onChange={(e) => handleSettingsChange({ formWidth: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item name="formMaxWidth" label="Max Width">
                      <Input 
                        value={formState.formMaxWidth}
                        onChange={(e) => handleSettingsChange({ formMaxWidth: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item name="formPadding" label="Form Padding">
                      <Input 
                        value={formState.formPadding}
                        onChange={(e) => handleSettingsChange({ formPadding: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item name="formBorderRadius" label="Border Radius">
                      <Input 
                        value={formState.formBorderRadius}
                        onChange={(e) => handleSettingsChange({ formBorderRadius: e.target.value })}
                      />
                    </Form.Item>
                  </Space>
                </Panel>

                <Panel header="Theme & Colors" key="2">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name="themeColor" label="Background Color">
                      <ColorPicker 
                        value={formState.themeColor}
                        onChange={(color) => handleSettingsChange({ themeColor: color.toHexString() })}
                      />
                    </Form.Item>
                    <Form.Item name="textColor" label="Text Color">
                      <ColorPicker 
                        value={formState.textColor}
                        onChange={(color) => handleSettingsChange({ textColor: color.toHexString() })}
                      />
                    </Form.Item>
                    <Form.Item name="accentColor" label="Accent Color">
                      <ColorPicker 
                        value={formState.accentColor}
                        onChange={(color) => handleSettingsChange({ accentColor: color.toHexString() })}
                      />
                    </Form.Item>
                    <Form.Item name="borderColor" label="Border Color">
                      <ColorPicker 
                        value={formState.borderColor}
                        onChange={(color) => handleSettingsChange({ borderColor: color.toHexString() })}
                      />
                    </Form.Item>
                  </Space>
                </Panel>

                <Panel header="Typography" key="3">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name="fontFamily" label="Font Family">
                      <Select
                        value={formState.fontFamily}
                        onChange={(value) => handleSettingsChange({ fontFamily: value })}
                      >
                        <Option value="Arial">Arial</Option>
                        <Option value="Helvetica">Helvetica</Option>
                        <Option value="Times New Roman">Times New Roman</Option>
                        <Option value="Georgia">Georgia</Option>
                        <Option value="Verdana">Verdana</Option>
                        <Option value="Courier New">Courier New</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="fontWeight" label="Font Weight">
                      <Select
                        value={formState.fontWeight}
                        onChange={(value) => handleSettingsChange({ fontWeight: value })}
                      >
                        <Option value="normal">Normal</Option>
                        <Option value="bold">Bold</Option>
                        <Option value="bolder">Bolder</Option>
                        <Option value="lighter">Lighter</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="fontSize" label="Font Size">
                      <Slider
                        min={12}
                        max={32}
                        value={formState.fontSize}
                        onChange={(value) => handleSettingsChange({ fontSize: value })}
                      />
                    </Form.Item>
                    <Form.Item name="lineHeight" label="Line Height">
                      <Slider
                        min={1}
                        max={2}
                        step={0.1}
                        value={formState.lineHeight}
                        onChange={(value) => handleSettingsChange({ lineHeight: value })}
                      />
                    </Form.Item>
                    <Form.Item name="letterSpacing" label="Letter Spacing">
                      <Select
                        value={formState.letterSpacing}
                        onChange={(value) => handleSettingsChange({ letterSpacing: value })}
                      >
                        <Option value="normal">Normal</Option>
                        <Option value="tight">Tight</Option>
                        <Option value="wide">Wide</Option>
                      </Select>
                    </Form.Item>
                  </Space>
                </Panel>

                <Panel header="Header" key="4">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name="headerText" label="Header Text">
                      <Input 
                        value={formState.headerText}
                        onChange={(e) => handleSettingsChange({ headerText: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item name="headerLogo" label="Header Logo">
                      <Upload
                        beforeUpload={() => false}
                        onChange={(info) => {
                          if (info.file) {
                            const reader = new FileReader();
                            reader.onload = (e) => {
                              handleSettingsChange({ headerLogo: e.target.result });
                            };
                            reader.readAsDataURL(info.file);
                          }
                        }}
                      >
                        <Button>Upload Logo</Button>
                      </Upload>
                    </Form.Item>
                    <Form.Item name="headerAlignment" label="Header Alignment">
                      <Select
                        value={formState.headerAlignment}
                        onChange={(value) => handleSettingsChange({ headerAlignment: value })}
                      >
                        <Option value="left">Left</Option>
                        <Option value="center">Center</Option>
                        <Option value="right">Right</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="headerPadding" label="Header Padding">
                      <Input 
                        value={formState.headerPadding}
                        onChange={(e) => handleSettingsChange({ headerPadding: e.target.value })}
                      />
                    </Form.Item>
                  </Space>
                </Panel>

                <Panel header="Element Styling" key="5">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name="elementSpacing" label="Element Spacing">
                      <Input 
                        value={formState.elementSpacing}
                        onChange={(e) => handleSettingsChange({ elementSpacing: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item name="elementBorderRadius" label="Element Border Radius">
                      <Input 
                        value={formState.elementBorderRadius}
                        onChange={(e) => handleSettingsChange({ elementBorderRadius: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item name="elementBackground" label="Element Background">
                      <ColorPicker 
                        value={formState.elementBackground}
                        onChange={(color) => handleSettingsChange({ elementBackground: color.toHexString() })}
                      />
                    </Form.Item>
                    <Form.Item name="elementBorderWidth" label="Element Border Width">
                      <Input 
                        value={formState.elementBorderWidth}
                        onChange={(e) => handleSettingsChange({ elementBorderWidth: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item name="elementPadding" label="Element Padding">
                      <Input 
                        value={formState.elementPadding}
                        onChange={(e) => handleSettingsChange({ elementPadding: e.target.value })}
                      />
                    </Form.Item>
                  </Space>
                </Panel>

                <Panel header="Button Styling" key="6">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name="buttonStyle" label="Button Style">
                      <Select
                        value={formState.buttonStyle}
                        onChange={(value) => handleSettingsChange({ buttonStyle: value })}
                      >
                        <Option value="primary">Primary</Option>
                        <Option value="default">Default</Option>
                        <Option value="dashed">Dashed</Option>
                        <Option value="text">Text</Option>
                        <Option value="link">Link</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="buttonShape" label="Button Shape">
                      <Select
                        value={formState.buttonShape}
                        onChange={(value) => handleSettingsChange({ buttonShape: value })}
                      >
                        <Option value="default">Default</Option>
                        <Option value="circle">Circle</Option>
                        <Option value="round">Round</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="buttonSize" label="Button Size">
                      <Select
                        value={formState.buttonSize}
                        onChange={(value) => handleSettingsChange({ buttonSize: value })}
                      >
                        <Option value="small">Small</Option>
                        <Option value="middle">Middle</Option>
                        <Option value="large">Large</Option>
                      </Select>
                    </Form.Item>
                  </Space>
                </Panel>

                <Panel header="Input Styling" key="7">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name="inputHeight" label="Input Height">
                      <Input 
                        value={formState.inputHeight}
                        onChange={(e) => handleSettingsChange({ inputHeight: e.target.value })}
                      />
                    </Form.Item>
                    <Form.Item name="inputBorderStyle" label="Border Style">
                      <Select
                        value={formState.inputBorderStyle}
                        onChange={(value) => handleSettingsChange({ inputBorderStyle: value })}
                      >
                        <Option value="solid">Solid</Option>
                        <Option value="dashed">Dashed</Option>
                        <Option value="dotted">Dotted</Option>
                      </Select>
                    </Form.Item>
                  </Space>
                </Panel>

                <Panel header="Label Styling" key="8">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Form.Item name="labelPosition" label="Label Position">
                      <Select
                        value={formState.labelPosition}
                        onChange={(value) => handleSettingsChange({ labelPosition: value })}
                      >
                        <Option value="top">Top</Option>
                        <Option value="left">Left</Option>
                        <Option value="right">Right</Option>
                      </Select>
                    </Form.Item>
                    <Form.Item name="labelColor" label="Label Color">
                      <ColorPicker 
                        value={formState.labelColor}
                        onChange={(color) => handleSettingsChange({ labelColor: color.toHexString() })}
                      />
                    </Form.Item>
                    <Form.Item name="labelFontSize" label="Label Font Size">
                      <Slider
                        min={12}
                        max={24}
                        value={formState.labelFontSize}
                        onChange={(value) => handleSettingsChange({ labelFontSize: value })}
                      />
                    </Form.Item>
                    <Form.Item name="labelFontWeight" label="Label Font Weight">
                      <Select
                        value={formState.labelFontWeight}
                        onChange={(value) => handleSettingsChange({ labelFontWeight: value })}
                      >
                        <Option value="normal">Normal</Option>
                        <Option value="bold">Bold</Option>
                        <Option value="bolder">Bolder</Option>
                        <Option value="lighter">Lighter</Option>
                      </Select>
                    </Form.Item>
                  </Space>
                </Panel>

                <Panel header="Form Elements" key="9">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Text strong>Basic Fields</Text>
                    <FormElement type="input" label="Text Input" />
                    <FormElement type="email" label="Email" />
                    <FormElement type="phone" label="Phone" />
                    <FormElement type="address" label="Address" />
                    <Divider />
                    <Text strong>Advanced Fields</Text>
                    <FormElement type="select" label="Dropdown" />
                    <FormElement type="date" label="Date Picker" />
                    <FormElement type="checkbox" label="Checkbox" />
                    <FormElement type="radio" label="Radio Buttons" />
                    <FormElement type="file" label="File Upload" />
                    <Divider />
                    <Text strong>Buttons</Text>
                    <FormElement type="button" label="Submit Button" />
                    <FormElement type="button" label="Next Page" />
                  </Space>
                </Panel>
              </Collapse>
            </Sidebar>
            <BuilderArea>
              {formState.isMultiPage ? (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Select
                      value={formState.currentPage}
                      onChange={handlePageChange}
                      style={{ width: 200 }}
                    >
                      {formState.pages.map((page, index) => (
                        <Option key={page.id} value={index}>Page {index + 1}</Option>
                      ))}
                    </Select>
                    <Button 
                      type="primary" 
                      onClick={handleAddPage}
                      style={{ marginLeft: 8 }}
                    >
                      Add Page
                    </Button>
                  </div>
                  <FormPreview 
                    themeColor={formState.themeColor} 
                    textColor={formState.textColor} 
                    fontFamily={formState.fontFamily}
                  >
                    {formState.headerText && (
                      <Title 
                        level={2} 
                        style={{ 
                          textAlign: 'center', 
                          marginBottom: 24,
                          fontFamily: formState.fontFamily,
                          fontWeight: formState.fontWeight,
                          fontSize: `${formState.fontSize + 8}px`,
                          color: formState.textColor
                        }}
                      >
                        {formState.headerText}
                      </Title>
                    )}
                    <FormDropZone
                      formItems={formState.pages[formState.currentPage].items}
                      onDrop={handleDrop}
                      onUpdate={(index, updates) => handleElementUpdate(formState.currentPage, index, updates)}
                      onRemove={(index) => handleElementRemove(formState.currentPage, index)}
                    />
                  </FormPreview>
                </div>
              ) : (
                <FormPreview 
                  themeColor={formState.themeColor} 
                  textColor={formState.textColor} 
                  fontFamily={formState.fontFamily}
                >
                  {formState.headerText && (
                    <Title 
                      level={2} 
                      style={{ 
                        textAlign: 'center', 
                        marginBottom: 24,
                        fontFamily: formState.fontFamily,
                        fontWeight: formState.fontWeight,
                        fontSize: `${formState.fontSize + 8}px`,
                        color: formState.textColor
                      }}
                    >
                      {formState.headerText}
                    </Title>
                  )}
                  <FormDropZone
                    formItems={formState.pages[0].items}
                    onDrop={handleDrop}
                    onUpdate={(index, updates) => handleElementUpdate(0, index, updates)}
                    onRemove={(index) => handleElementRemove(0, index)}
                  />
                </FormPreview>
              )}
            </BuilderArea>
          </BuilderContainer>
        </div>
      ),
    },
    {
      title: 'Review & Publish',
      content: (
        <div>
          <FormPreview
            themeColor={formState.themeColor}
            textColor={formState.textColor}
            fontFamily={formState.fontFamily}
          >
            {formState.headerText && (
              <Title 
                level={2} 
                style={{ 
                  textAlign: 'center', 
                  marginBottom: 24,
                  fontFamily: formState.fontFamily,
                  fontWeight: formState.fontWeight,
                  fontSize: `${formState.fontSize + 8}px`,
                  color: formState.textColor
                }}
              >
                {formState.headerText}
              </Title>
            )}
            <Form form={form} layout="vertical">
              {formState.isMultiPage ? (
                formState.pages.map((page, pageIndex) => (
                  <div key={page.id}>
                    <Title 
                      level={3}
                      style={{
                        fontFamily: formState.fontFamily,
                        fontWeight: formState.fontWeight,
                        fontSize: `${formState.fontSize + 4}px`,
                        color: formState.textColor
                      }}
                    >
                      Page {pageIndex + 1}
                    </Title>
                    {page.items.map((item, index) => (
                      <Form.Item 
                        key={item.id} 
                        label={item.label}
                        style={{
                          fontFamily: formState.fontFamily,
                          fontWeight: formState.fontWeight,
                          fontSize: `${formState.fontSize}px`,
                          color: formState.textColor
                        }}
                      >
                        {renderFormElement(item)}
                      </Form.Item>
                    ))}
                  </div>
                ))
              ) : (
                formState.pages[0].items.map((item, index) => (
                  <Form.Item 
                    key={item.id} 
                    label={item.label}
                    style={{
                      fontFamily: formState.fontFamily,
                      fontWeight: formState.fontWeight,
                      fontSize: `${formState.fontSize}px`,
                      color: formState.textColor
                    }}
                  >
                    {renderFormElement(item)}
                  </Form.Item>
                ))
              )}
            </Form>
          </FormPreview>
          <div style={{ marginTop: 24 }}>
            <Title level={4}>Marketing Pixel Configuration</Title>
            <Form.Item name="marketingPixel" label="Paste your tracking pixel code here">
              <Input.TextArea 
                rows={4}
                value={formState.marketingPixel}
                onChange={(e) => handleSettingsChange({ marketingPixel: e.target.value })}
              />
            </Form.Item>
            {formState.marketingPixel && (
              <div style={{ 
                background: '#f5f5f5', 
                padding: 16, 
                borderRadius: 8,
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {formState.marketingPixel}
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  const next = () => {
    setCurrentStep(currentStep + 1);
  };

  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Card>
        <Steps current={currentStep} style={{ marginBottom: 24 }}>
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        {isPreviewMode ? (
          <div style={{ 
            border: '1px solid #d9d9d9', 
            padding: 24, 
            borderRadius: 8,
            background: isMobilePreview ? '#f5f5f5' : 'white',
            maxWidth: isMobilePreview ? '375px' : '100%',
            margin: '0 auto'
          }}>
            <div style={{ marginBottom: 16, textAlign: 'right' }}>
              <Button 
                type="primary" 
                icon={isMobilePreview ? <DesktopOutlined /> : <MobileOutlined />}
                onClick={handleMobilePreview}
              >
                {isMobilePreview ? 'Desktop View' : 'Mobile View'}
              </Button>
            </div>
            {/* Preview content */}
          </div>
        ) : (
          steps[currentStep].content
        )}

        <div style={{ marginTop: 24 }}>
          {currentStep > 0 && (
            <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={() => next()}>
              Next
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={handleSubmit}>
              Done
            </Button>
          )}
        </div>

        {/* Help Modal */}
        <Modal
          title="Help"
          visible={showHelp}
          onCancel={() => setShowHelp(false)}
          footer={null}
        >
          <div>
            <h3>Form Builder Guide</h3>
            <p>1. Drag and drop elements from the sidebar to the form area</p>
            <p>2. Click on elements to edit their properties</p>
            <p>3. Use the toolbar buttons to manage your form</p>
            <p>4. Preview your form before publishing</p>
          </div>
        </Modal>

        {/* Settings Modal */}
        <Modal
          title="Settings"
          visible={showSettings}
          onCancel={() => setShowSettings(false)}
          footer={null}
        >
          <Form layout="vertical">
            <Form.Item label="Auto-save">
              <Switch defaultChecked />
            </Form.Item>
            <Form.Item label="Show grid">
              <Switch defaultChecked />
            </Form.Item>
            <Form.Item label="Snap to grid">
              <Switch defaultChecked />
            </Form.Item>
          </Form>
        </Modal>

        {/* Templates Modal */}
        <Modal
          title="Templates"
          visible={showTemplates}
          onCancel={() => setShowTemplates(false)}
          footer={null}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {['Contact Form', 'Survey', 'Registration', 'Feedback', 'Order Form', 'Quote Request'].map(template => (
              <Card key={template} hoverable>
                <div style={{ textAlign: 'center' }}>
                  <img src={`/templates/${template.toLowerCase().replace(' ', '-')}.png`} alt={template} style={{ width: '100%' }} />
                  <p>{template}</p>
                </div>
              </Card>
            ))}
          </div>
        </Modal>

        {/* History Modal */}
        <Modal
          title="History"
          visible={showHistory}
          onCancel={() => setShowHistory(false)}
          footer={null}
        >
          <Timeline>
            <Timeline.Item>Created form</Timeline.Item>
            <Timeline.Item>Added text input</Timeline.Item>
            <Timeline.Item>Added email field</Timeline.Item>
            <Timeline.Item>Changed theme color</Timeline.Item>
          </Timeline>
        </Modal>

        {/* Share Modal */}
        <Modal
          title="Share Form"
          visible={showShare}
          onCancel={() => setShowShare(false)}
          footer={null}
        >
          <Form layout="vertical">
            <Form.Item label="Share Link">
              <Input addonAfter={<Button>Copy</Button>} value="https://form-builder.com/forms/123" />
            </Form.Item>
            <Form.Item label="Embed Code">
              <Input.TextArea rows={4} value='<iframe src="https://form-builder.com/forms/123"></iframe>' />
            </Form.Item>
          </Form>
        </Modal>

        {/* Export Modal */}
        <Modal
          title="Export Form"
          visible={showExport}
          onCancel={() => setShowExport(false)}
          footer={null}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Button block>Export as HTML</Button>
            <Button block>Export as JSON</Button>
            <Button block>Export as PDF</Button>
            <Button block>Export as Image</Button>
          </Space>
        </Modal>

        {/* Import Modal */}
        <Modal
          title="Import Form"
          visible={showImport}
          onCancel={() => setShowImport(false)}
          footer={null}
        >
          <Upload.Dragger>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibit from uploading company data or other
              band files
            </p>
          </Upload.Dragger>
        </Modal>
      </Card>
    </DndProvider>
  );
};

export default FormBuilder; 