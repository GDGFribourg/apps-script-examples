// ===== React to simple triggers
// See https://developers.google.com/apps-script/guides/triggers

/** Runs when a user installs an add-on. */
function onInstall(e) {
  onOpen(e);
}

/** Runs when a user opens a Doc */
function onOpen(e) {
  // Register our add-on: this will add it to the sidebar
  DocumentApp.getUi().createAddonMenu()
    .addItem('Show Sidebar', 'showSidebar') // button + callback
    .addItem('Create Table From Selection', 'createTableFromPrefs')
    .addSeparator()
    .addItem('Clear Preferences', 'deletePreferences')
    .addToUi();
}


// ===== Preferences handling

/** Save every key/value in prefs to the User Preferences */
function savePreferences(prefs) {
  let userProps = PropertiesService.getUserProperties();
  for (let key in prefs)
    userProps.setProperty(key, prefs[key]);
}

/** Read and return all key/values previously saved in User Preferences */
function loadPreferences() {
  return PropertiesService.getUserProperties().getProperties();
}

/** Delete all User Preference */
function deletePreferences() {
  PropertiesService.getUserProperties().deleteAllProperties();
}


// ===== Main functions

/** Render our sidebar.html when the users click on Addon > Start **/
function showSidebar() {
  var ui = HtmlService
    .createHtmlOutputFromFile('sidebar')
    .setTitle('Create table');
  DocumentApp.getUi().showSidebar(ui);
}

/** Call createTable using the previously saved preferences **/
function createTableFromPrefs() {
  createTable(loadPreferences());
}


/**
* Generate the table from a CSV selection inside the Document
* @param {object} options: function parameters, that can include:
*  - {string} separator: the CSV column separator
*  - {boolean} sameWidth: if true, ensure all rows have the same number of columns
*  - {boolean} addNewline: if true, add new line before/after the created table
*  - {string} borderColor: hex color of the border (optional)
*/
function createTable(options) {
  const { separator, sameWidth = true, addNewline = true, borderColor } = options;
  const selection = DocumentApp.getActiveDocument().getSelection();

  if (selection) {
    // We have a selection !
    const body = DocumentApp.getActiveDocument().getBody();
    const elements = selection.getRangeElements();

    // Iterate through the selection elements, extracting each line as text
    // Keep track of the last non-empty element as well
    const lines = [];
    for (let i = 0; i < elements.length; ++i) {
      let elt = elements[i].getElement();
      let type = elt.getType();

      // Ensure we only have text elements
      // Note: PARAGRAPH are top-most elements, TEXT are children on paragraphs
      if (type != DocumentApp.ElementType.PARAGRAPH && type != DocumentApp.ElementType.TEXT) {
        throw Error('The selection should contain text only');
      }

      // only keep non empty text
      let text = elt.asText().getText().trim();
      if (text.length) {
        lines.push(text);
      }
    }

    // Ensure we have something
    if (lines.length == 0) {
      throw Error('Empty selection');
    }

    // Parse the selected lines (CSV) into a 2D array of table cells
    const cells = parseCSV(lines, separator);
    Logger.log('Parsed cells', cells);

    // If asked, ensure all the rows have the same number of columns
    if (sameWidth) {
      normalize2DArray(cells);
      Logger.log('Normalized cells', cells);
    }

    // Find where to insert: find the index of the last selected element 
    // and increment its index by 1
    let lastSelected = elements[elements.length - 1].getElement();
    if (lastSelected.getType() == DocumentApp.ElementType.TEXT)
      // avoid "Element does not contain the specified child element." errors
      lastSelected = lastSelected.getParent();
    let insertIndex = body.getChildIndex(lastSelected) + 1;

    // Insert table, potentially adding new lines around
    if (addNewline) body.insertParagraph(insertIndex++, "");
    const tableIndex = insertIndex; body.insertTable(insertIndex++, cells);
    if (addNewline) body.insertParagraph(insertIndex++, "");

    // If asked, change the borderColor
    if (borderColor) {
      // First fetch the Table instance created for us, then change the color
      body.getChild(tableIndex).asTable().setBorderColor(borderColor);
    }

  } else {
    // Just show an error in the sidebar. 
    // For a dialog instead, use: DocumentApp.getUi().alert('Nothing is selected.');
    throw new Error('Please select some text.');
  }
}