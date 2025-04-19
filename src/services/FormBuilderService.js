import { v4 as uuidv4 } from 'uuid';

class FormBuilderService {
  constructor() {
    this.formState = {
      name: '',
      description: '',
      isMultiPage: false,
      // Theme and Colors
      themeColor: '#ffffff',
      textColor: '#000000',
      accentColor: '#1890ff',
      borderColor: '#d9d9d9',
      // Typography
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontSize: 16,
      lineHeight: 1.5,
      letterSpacing: 'normal',
      // Header
      headerText: '',
      headerLogo: null,
      headerAlignment: 'center',
      headerPadding: 24,
      // Form Layout
      formWidth: '100%',
      formMaxWidth: '800px',
      formPadding: 24,
      formBorderRadius: 8,
      formBoxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      // Element Styling
      elementSpacing: 16,
      elementBorderRadius: 4,
      elementBackground: '#ffffff',
      elementBorderWidth: 1,
      elementPadding: 8,
      // Button Styling
      buttonStyle: 'primary',
      buttonShape: 'default',
      buttonSize: 'middle',
      // Input Styling
      inputHeight: 32,
      inputBorderStyle: 'solid',
      // Label Styling
      labelPosition: 'top',
      labelColor: '#000000',
      labelFontSize: 14,
      labelFontWeight: 'normal',
      // Marketing
      marketingPixel: '',
      // Pages
      pages: [{ id: uuidv4(), title: 'Page 1', items: [] }],
      currentPage: 0
    };
  }

  // Form Settings
  updateFormSettings(settings) {
    this.formState = { ...this.formState, ...settings };
    return this.formState;
  }

  // Page Management
  addPage() {
    const newPage = {
      id: uuidv4(),
      title: `Page ${this.formState.pages.length + 1}`,
      items: []
    };
    this.formState.pages.push(newPage);
    return this.formState;
  }

  setCurrentPage(pageIndex) {
    this.formState.currentPage = pageIndex;
    return this.formState;
  }

  // Form Elements
  addFormElement(element) {
    const newElement = {
      id: uuidv4(),
      type: element.type,
      label: element.label,
      required: false,
      placeholder: element.label,
      alignment: 'left',
      width: '100%',
      margin: '0',
      padding: '8px',
      options: element.type === 'select' || element.type === 'radio' || element.type === 'checkbox' 
        ? ['Option 1', 'Option 2'] 
        : undefined
    };

    if (this.formState.isMultiPage) {
      this.formState.pages[this.formState.currentPage].items.push(newElement);
    } else {
      this.formState.pages[0].items.push(newElement);
    }

    return this.formState;
  }

  updateFormElement(pageIndex, elementIndex, updates) {
    this.formState.pages[pageIndex].items[elementIndex] = {
      ...this.formState.pages[pageIndex].items[elementIndex],
      ...updates
    };
    return this.formState;
  }

  removeFormElement(pageIndex, elementIndex) {
    this.formState.pages[pageIndex].items.splice(elementIndex, 1);
    return this.formState;
  }

  // Form Data
  getFormState() {
    return this.formState;
  }

  resetForm() {
    this.formState = {
      name: '',
      description: '',
      isMultiPage: false,
      themeColor: '#ffffff',
      textColor: '#000000',
      accentColor: '#1890ff',
      borderColor: '#d9d9d9',
      fontFamily: 'Arial',
      fontWeight: 'normal',
      fontSize: 16,
      lineHeight: 1.5,
      letterSpacing: 'normal',
      headerText: '',
      headerLogo: null,
      headerAlignment: 'center',
      headerPadding: 24,
      formWidth: '100%',
      formMaxWidth: '800px',
      formPadding: 24,
      formBorderRadius: 8,
      formBoxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      elementSpacing: 16,
      elementBorderRadius: 4,
      elementBackground: '#ffffff',
      elementBorderWidth: 1,
      elementPadding: 8,
      buttonStyle: 'primary',
      buttonShape: 'default',
      buttonSize: 'middle',
      inputHeight: 32,
      inputBorderStyle: 'solid',
      labelPosition: 'top',
      labelColor: '#000000',
      labelFontSize: 14,
      labelFontWeight: 'normal',
      marketingPixel: '',
      pages: [{ id: uuidv4(), title: 'Page 1', items: [] }],
      currentPage: 0
    };
    return this.formState;
  }
}

export default new FormBuilderService(); 