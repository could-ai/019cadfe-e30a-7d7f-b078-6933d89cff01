// Keyboard mapping based on user requirements
const charMap = {
  'q': 'ض', 'w': 'ص', 'e': 'ث', 'r': 'ق', 't': 'ف',
  'y': 'غ', 'u': 'ع', 'i': 'ه', 'o': 'خ', 'p': 'ح',
  '[': 'ج', ']': 'د',
  'a': 'ش', 's': 'س', 'd': 'ي', 'f': 'ب', 'g': 'ل',
  'h': 'ا', 'j': 'ت', 'k': 'ن', 'l': 'م', ';': 'ك', '\'': 'ط',
  'z': 'ئ', 'x': 'ء', 'c': 'ؤ', 'v': 'ر', 'b': 'لا',
  'n': 'ى', 'm': 'ة', ',': 'و', '.': 'ز', '/': 'ظ'
};

// Helper to map a single character
function getMappedChar(char) {
  const lower = char.toLowerCase();
  // If the character is in the map (lowercase check), return it.
  // Otherwise return the original character.
  // Note: We map uppercase English letters to the same Arabic characters
  // because Arabic script does not have capitalization.
  if (charMap.hasOwnProperty(lower)) {
    return charMap[lower];
  }
  return char;
}

// Function to convert a string
function convertString(text) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += getMappedChar(text[i]);
  }
  return result;
}

// Main conversion logic
function convertSelection() {
  const activeElement = document.activeElement;
  
  // Case 1: Input or Textarea
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    // Ignore non-text inputs
    if (activeElement.tagName === 'INPUT') {
      const type = activeElement.type.toLowerCase();
      const validTypes = ['text', 'search', 'url', 'tel', 'password', 'email', 'number'];
      if (!validTypes.includes(type)) return;
    }

    // Check if readonly
    if (activeElement.readOnly || activeElement.disabled) return;

    const start = activeElement.selectionStart;
    const end = activeElement.selectionEnd;

    // If no text is selected, do nothing
    if (start === end) return;

    const originalText = activeElement.value.substring(start, end);
    const convertedText = convertString(originalText);

    // Replace text
    // setRangeText is supported in modern browsers
    try {
      activeElement.setRangeText(convertedText, start, end, 'select');
      
      // Dispatch input event to notify frameworks (React, Angular, etc.)
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      activeElement.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (e) {
      console.error('Failed to set text range:', e);
    }
  }
  
  // Case 2: ContentEditable (div, span, etc.)
  else if (activeElement && activeElement.isContentEditable) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return; // No selection

    const originalText = range.toString();
    const convertedText = convertString(originalText);

    // Use execCommand 'insertText' to preserve undo history and trigger events
    // This is technically deprecated but is the only reliable way to interact 
    // with complex editors (like WhatsApp, Facebook, Gmail) correctly.
    try {
      document.execCommand('insertText', false, convertedText);
    } catch (e) {
      // Fallback for environments where execCommand might fail
      range.deleteContents();
      range.insertNode(document.createTextNode(convertedText));
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}

// Listen for Alt+R
document.addEventListener('keydown', (e) => {
  // Check for Alt key and 'R' key (code KeyR handles layout independence better usually, but key 'r' is safer for mapping)
  if (e.altKey && (e.code === 'KeyR' || e.key === 'r' || e.key === 'R')) {
    // Prevent default browser behavior if any
    e.preventDefault();
    e.stopPropagation();
    
    convertSelection();
  }
}, true); // Use capture phase to ensure we catch it before some sites might stop propagation
