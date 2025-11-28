import React from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Pagination, Chip, Card, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { addToast } from '@heroui/react';

interface Document {
  id: string;
  name: string;
  type: 'Medical Record' | 'Lab Result' | 'Prescription' | 'Referral' | 'Consent Form' | 'Other';
  patientName: string;
  patientId: string;
  uploadedBy: string;
  uploadDate: string;
  size: string;
  status: 'Active' | 'Archived' | 'Pending Review';
}

export const GestionDocumentos: React.FC = () => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [documents, setDocuments] = React.useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedDocType, setSelectedDocType] = React.useState<string>('all');
  
  // Mock document data
  React.useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockDocuments: Document[] = [
        { id: 'DOC-2023-001', name: 'Medical History Report.pdf', type: 'Medical Record', patientName: 'Maria Garcia', patientId: 'P001', uploadedBy: 'Dr. Jane Smith', uploadDate: '2023-09-15', size: '2.4 MB', status: 'Active' },
        { id: 'DOC-2023-002', name: 'Blood Test Results.pdf', type: 'Lab Result', patientName: 'John Smith', patientId: 'P002', uploadedBy: 'Dr. Michael Chen', uploadDate: '2023-09-14', size: '1.8 MB', status: 'Active' },
        { id: 'DOC-2023-003', name: 'Dermatology Prescription.pdf', type: 'Prescription', patientName: 'Robert Johnson', patientId: 'P003', uploadedBy: 'Dr. Sarah Lee', uploadDate: '2023-09-12', size: '0.5 MB', status: 'Active' },
        { id: 'DOC-2023-004', name: 'Ophthalmology Referral.pdf', type: 'Referral', patientName: 'Sarah Williams', patientId: 'P004', uploadedBy: 'Dr. James Wilson', uploadDate: '2023-09-10', size: '1.2 MB', status: 'Pending Review' },
        { id: 'DOC-2023-005', name: 'Surgery Consent Form.pdf', type: 'Consent Form', patientName: 'Michael Brown', patientId: 'P005', uploadedBy: 'Dr. Emily Rodriguez', uploadDate: '2023-09-08', size: '0.8 MB', status: 'Active' },
        { id: 'DOC-2023-006', name: 'Diabetes Treatment Plan.pdf', type: 'Medical Record', patientName: 'Jennifer Davis', patientId: 'P006', uploadedBy: 'Dr. Robert Kim', uploadDate: '2023-09-05', size: '1.5 MB', status: 'Active' },
        { id: 'DOC-2023-007', name: 'Chest X-Ray Results.pdf', type: 'Lab Result', patientName: 'David Miller', patientId: 'P007', uploadedBy: 'Dr. Lisa Chen', uploadDate: '2023-09-03', size: '3.2 MB', status: 'Archived' },
        { id: 'DOC-2023-008', name: 'Gastroenterology Report.pdf', type: 'Medical Record', patientName: 'Lisa Wilson', patientId: 'P008', uploadedBy: 'Dr. Thomas Johnson', uploadDate: '2023-09-01', size: '2.1 MB', status: 'Active' },
      ];
      
      setDocuments(mockDocuments);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  // Filter documents based on search term and document type
  const filteredDocuments = documents.filter(document => {
    const matchesSearch = 
      document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      document.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedDocType === 'all') return matchesSearch;
    return matchesSearch && document.type === selectedDocType;
  });
  
  // Pagination
  const rowsPerPage = 5;
  const pages = Math.ceil(filteredDocuments.length / rowsPerPage);
  const paginatedDocuments = filteredDocuments.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  
  const handleArchiveDocument = (documentId: string) => {
    setDocuments(documents.map(doc => 
      doc.id === documentId 
        ? { ...doc, status: 'Archived' as const } 
        : doc
    ));
    
    addToast({
      title: "Document Archived",
      description: `Document ${documentId} has been archived successfully`,
      color: "success"
    });
  };
  
  const handleActivateDocument = (documentId: string) => {
    setDocuments(documents.map(doc => 
      doc.id === documentId 
        ? { ...doc, status: 'Active' as const } 
        : doc
    ));
    
    addToast({
      title: "Document Activated",
      description: `Document ${documentId} has been activated successfully`,
      color: "success"
    });
  };
  
  const handleApproveDocument = (documentId: string) => {
    setDocuments(documents.map(doc => 
      doc.id === documentId 
        ? { ...doc, status: 'Active' as const } 
        : doc
    ));
    
    addToast({
      title: "Document Approved",
      description: `Document ${documentId} has been approved and is now active`,
      color: "success"
    });
  };
  
  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Archived': return 'default';
      case 'Pending Review': return 'warning';
      default: return 'default';
    }
  };
  
  const getDocumentTypeIcon = (type: Document['type']) => {
    switch (type) {
      case 'Medical Record': return 'lucide:clipboard';
      case 'Lab Result': return 'lucide:flask-conical';
      case 'Prescription': return 'lucide:pill';
      case 'Referral': return 'lucide:send';
      case 'Consent Form': return 'lucide:file-signature';
      default: return 'lucide:file';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Document Management</h1>
        <div className="flex gap-2">
          <Button color="primary" startContent={<Icon icon="lucide:upload" />} onPress={onOpen}>
            Upload Document
          </Button>
          <Button variant="flat" startContent={<Icon icon="lucide:download" />}>
            Export List
          </Button>
        </div>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border border-default-200">
          <CardBody>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <Input
                placeholder="Search by document name, patient or ID..."
                value={searchTerm}
                onValueChange={setSearchTerm}
                startContent={<Icon icon="lucide:search" className="text-default-400" />}
                className="w-full sm:max-w-xs"
              />
              
              <div className="flex gap-2">
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="flat" endContent={<Icon icon="lucide:chevron-down" />}>
                      {selectedDocType === 'all' ? 'All Document Types' : selectedDocType}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu 
                    aria-label="Document type filter"
                    selectedKeys={[selectedDocType]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setSelectedDocType(selected);
                    }}
                    selectionMode="single"
                  >
                    <DropdownItem key="all">All Document Types</DropdownItem>
                    <DropdownItem key="Medical Record">Medical Records</DropdownItem>
                    <DropdownItem key="Lab Result">Lab Results</DropdownItem>
                    <DropdownItem key="Prescription">Prescriptions</DropdownItem>
                    <DropdownItem key="Referral">Referrals</DropdownItem>
                    <DropdownItem key="Consent Form">Consent Forms</DropdownItem>
                    <DropdownItem key="Other">Other Documents</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
                
                <Dropdown>
                  <DropdownTrigger>
                    <Button variant="flat" endContent={<Icon icon="lucide:filter" />}>
                      Status
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Status filter">
                    <DropdownItem key="all">All Statuses</DropdownItem>
                    <DropdownItem key="active">Active</DropdownItem>
                    <DropdownItem key="archived">Archived</DropdownItem>
                    <DropdownItem key="pending">Pending Review</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
            
            <Table 
              aria-label="Documents table"
              removeWrapper
              bottomContent={
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color="primary"
                    page={page}
                    total={pages}
                    onChange={setPage}
                  />
                </div>
              }
            >
              <TableHeader>
                <TableColumn>ID</TableColumn>
                <TableColumn>DOCUMENT</TableColumn>
                <TableColumn>TYPE</TableColumn>
                <TableColumn>PATIENT</TableColumn>
                <TableColumn>UPLOADED BY</TableColumn>
                <TableColumn>DATE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody 
                isLoading={isLoading}
                loadingContent={<div className="py-8">Loading documents...</div>}
                emptyContent={<div className="py-8">No documents found</div>}
              >
                {paginatedDocuments.map((document) => (
                  <TableRow key={document.id}>
                    <TableCell>{document.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Icon icon={getDocumentTypeIcon(document.type)} className="text-default-500" />
                        <span className="max-w-[200px] truncate">{document.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{document.type}</TableCell>
                    <TableCell>
                      <div>
                        <div>{document.patientName}</div>
                        <div className="text-tiny text-foreground-500">ID: {document.patientId}</div>
                      </div>
                    </TableCell>
                    <TableCell>{document.uploadedBy}</TableCell>
                    <TableCell>
                      <div>
                        <div>{document.uploadDate}</div>
                        <div className="text-tiny text-foreground-500">{document.size}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        size="sm" 
                        color={getStatusColor(document.status)}
                        variant="flat"
                      >
                        {document.status}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:eye" className="text-default-500" />
                        </Button>
                        <Button isIconOnly size="sm" variant="light">
                          <Icon icon="lucide:download" className="text-default-500" />
                        </Button>
                        <Dropdown>
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
                              <Icon icon="lucide:more-vertical" className="text-default-500" />
                            </Button>
                          </DropdownTrigger>
                          <DropdownMenu aria-label="Actions">
                            <DropdownItem key="view">View Document</DropdownItem>
                            <DropdownItem key="download">Download</DropdownItem>
                            <DropdownItem key="share">Share Document</DropdownItem>
                            {document.status === 'Active' && (
                              <DropdownItem 
                                key="archive" 
                                onPress={() => handleArchiveDocument(document.id)}
                              >
                                Archive Document
                              </DropdownItem>
                            )}
                            {document.status === 'Archived' && (
                              <DropdownItem 
                                key="activate" 
                                onPress={() => handleActivateDocument(document.id)}
                              >
                                Activate Document
                              </DropdownItem>
                            )}
                            {document.status === 'Pending Review' && (
                              <DropdownItem 
                                key="approve" 
                                onPress={() => handleApproveDocument(document.id)}
                              >
                                Approve Document
                              </DropdownItem>
                            )}
                            <DropdownItem 
                              key="delete" 
                              className="text-danger"
                              description="This action cannot be undone"
                            >
                              Delete Document
                            </DropdownItem>
                          </DropdownMenu>
                        </Dropdown>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </motion.div>
      
      {/* Upload Document Modal */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Upload New Document</ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-default-200 rounded-lg p-8 text-center">
                    <Icon icon="lucide:upload-cloud" className="text-4xl text-default-400 mx-auto mb-2" />
                    <p className="text-foreground-600 mb-2">Drag and drop your files here or click to browse</p>
                    <p className="text-tiny text-foreground-500">Supported formats: PDF, JPG, PNG, DOCX (Max 10MB)</p>
                    <Button 
                      color="primary" 
                      variant="flat" 
                      className="mt-4"
                      startContent={<Icon icon="lucide:upload" />}
                    >
                      Select Files
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Document Name"
                      placeholder="Enter document name"
                      isRequired
                    />
                    
                    <Input
                      label="Document Type"
                      placeholder="Select document type"
                      isRequired
                    />
                    
                    <Input
                      label="Patient ID"
                      placeholder="Enter patient ID"
                      isRequired
                    />
                    
                    <Input
                      label="Patient Name"
                      placeholder="Enter patient name"
                      isRequired
                    />
                  </div>
                  
                  <Input
                    label="Additional Notes"
                    placeholder="Enter any additional notes about this document"
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="flat" onPress={onClose}>
                  Cancel
                </Button>
                <Button color="primary" onPress={onClose}>
                  Upload Document
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};