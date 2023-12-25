from OCC.Core.STEPCAFControl import STEPCAFControl_Reader
from OCC.Core.TCollection import TCollection_ExtendedString
from OCC.Core.TDF import TDF_Label
from OCC.Core.TDocStd import TDocStd_Document
from OCC.Core.TDataStd import TDataStd_Name
from OCC.Core.XCAFDoc import XCAFDoc_DocumentTool_ShapeTool
from OCC.Core.TDataStd import TDataStd_Name
from OCC.Core.TCollection import TCollection_AsciiString

def get_label_name(label: TDF_Label):
  name = TDataStd_Name()
  if label.FindAttribute(TDataStd_Name.GetID(), name):
      return TCollection_AsciiString(name.Get()).ToCString()

def read_step_file_with_names_colors(filename):
    doc = TDocStd_Document(TCollection_ExtendedString("mdtv-xcaf"))
    # # Create the application
    # app = XCAFApp_Application.GetApplication().GetObject()
    # app.NewDocument(TCollection_ExtendedString("MDTV-CAF"), h_doc)
    # Get root assembly
    # Get shape tool
    shape_tool = XCAFDoc_DocumentTool_ShapeTool(doc.Main())
    # Initialize reader and read file
    step_reader = STEPCAFControl_Reader()
    step_reader.SetColorMode(True)
    step_reader.SetNameMode(True)
    step_reader.ReadFile(filename)
    step_reader.Transfer(doc)

    labels = []

    def _process_label(label):
        labels.append((label, get_label_name(label)))
        for child in label.GetChilds():
            _process_label(child)

    _process_label(doc.Main())

    return labels

# Usage
filename = "c:\\users\\GXLYQ_AIR\\Desktop\\web-cad\\test\\as1-oc-214-mat.stp"
labels = read_step_file_with_names_colors(filename)
for label in labels:
    print(label)