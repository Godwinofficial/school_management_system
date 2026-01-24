import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { ExcelService, ValidationResult } from "@/lib/ExcelService";

interface ImportExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: 'import' | 'export';
    type: 'students' | 'classes' | 'grading' | 'teachers';
    onImport?: (data: any[]) => Promise<void>;
    onExport?: () => any[];
    title?: string;
}

export function ImportExportDialog({
    open,
    onOpenChange,
    mode,
    type,
    onImport,
    onExport,
    title
}: ImportExportDialogProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [importing, setImporting] = useState(false);
    const [validation, setValidation] = useState<ValidationResult | null>(null);
    const [importedData, setImportedData] = useState<any[]>([]);
    const [progress, setProgress] = useState(0);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (selectedFile: File) => {
        // Validate file type
        if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
            alert('Please select an Excel file (.xlsx or .xls)');
            return;
        }

        setFile(selectedFile);
        setImporting(true);
        setProgress(30);

        try {
            let result;

            if (type === 'students') {
                result = await ExcelService.importStudentsFromExcel(selectedFile);
            } else if (type === 'classes') {
                result = await ExcelService.importClassesFromExcel(selectedFile);
            } else if (type === 'grading') {
                result = await ExcelService.importGradingSystemFromExcel(selectedFile);
            } else if (type === 'teachers') {
                result = await ExcelService.importTeachersFromExcel(selectedFile);
            }

            setProgress(70);

            if (result) {
                setImportedData(type === 'grading' ? [result.data] : result.data);
                setValidation(result.validation);
            }

            setProgress(100);
        } catch (error) {
            alert(`Error importing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setFile(null);
        } finally {
            setImporting(false);
        }
    };

    const handleDownloadTemplate = () => {
        if (type === 'students') {
            ExcelService.downloadStudentTemplate();
        } else if (type === 'classes') {
            ExcelService.downloadClassTemplate();
        } else if (type === 'grading') {
            ExcelService.downloadGradingTemplate();
        } else if (type === 'teachers') {
            ExcelService.downloadTeacherTemplate();
        }
    };

    const handleConfirmImport = async () => {
        if (onImport && importedData.length > 0) {
            try {
                await onImport(importedData);
                onOpenChange(false);
                // Reset state
                setFile(null);
                setImportedData([]);
                setValidation(null);
                setProgress(0);
            } catch (error) {
                alert(`Error saving data: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }
    };

    const handleExport = () => {
        if (onExport) {
            const data = onExport();

            if (type === 'students') {
                ExcelService.exportStudentsToExcel(data, `students_${new Date().toISOString().split('T')[0]}.xlsx`);
            } else if (type === 'classes') {
                ExcelService.exportClassesToExcel(data, `classes_${new Date().toISOString().split('T')[0]}.xlsx`);
            } else if (type === 'grading') {
                ExcelService.exportGradingSystemToExcel(data, `grading_system_${new Date().toISOString().split('T')[0]}.xlsx`);
            } else if (type === 'teachers') {
                // ExcelService.exportTeachersToExcel(data, ...);
            }

            onOpenChange(false);
        }
    };

    const getTypeLabel = () => {
        if (type === 'students') return 'Students';
        if (type === 'classes') return 'Classes';
        if (type === 'teachers') return 'Teachers';
        return 'Grading System';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {title || `${mode === 'import' ? 'Import' : 'Export'} ${getTypeLabel()}`}
                    </DialogTitle>
                    <DialogDescription>
                        {mode === 'import'
                            ? `Upload an Excel file to import ${getTypeLabel().toLowerCase()} data. Download the template for the correct format.`
                            : `Export ${getTypeLabel().toLowerCase()} data to an Excel file.`
                        }
                    </DialogDescription>
                </DialogHeader>

                {mode === 'import' ? (
                    <div className="space-y-4">
                        {/* Template Download */}
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                <div>
                                    <p className="font-medium text-sm">Download Template</p>
                                    <p className="text-xs text-muted-foreground">Get the Excel template with correct column headers</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                            </Button>
                        </div>

                        {/* File Upload Area */}
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-slate-300 hover:border-slate-400'
                                }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileInput}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <Upload className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                            <p className="text-sm font-medium mb-1">
                                {file ? file.name : 'Drop your Excel file here, or click to browse'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Supports .xlsx and .xls files
                            </p>
                        </div>

                        {/* Import Progress */}
                        {importing && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>Processing file...</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} />
                            </div>
                        )}

                        {/* Validation Results */}
                        {validation && (
                            <div className="space-y-3">
                                <Alert variant={validation.valid ? "default" : "destructive"}>
                                    <div className="flex items-start gap-3">
                                        {validation.valid ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5" />
                                        )}
                                        <div className="flex-1">
                                            <p className="font-medium text-sm mb-2">
                                                {validation.valid ? 'Validation Successful' : 'Validation Errors Found'}
                                            </p>
                                            <AlertDescription>
                                                <div className="grid grid-cols-3 gap-4 text-sm">
                                                    <div>
                                                        <span className="font-medium">Total Rows:</span> {validation.totalRows}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Valid:</span> {validation.validRows}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium">Errors:</span> {validation.errors.length}
                                                    </div>
                                                </div>
                                            </AlertDescription>
                                        </div>
                                    </div>
                                </Alert>

                                {/* Error List */}
                                {validation.errors.length > 0 && (
                                    <div className="max-h-48 overflow-y-auto border rounded-lg p-3 bg-slate-50">
                                        <p className="font-medium text-sm mb-2">Errors:</p>
                                        <div className="space-y-1">
                                            {validation.errors.slice(0, 20).map((error, index) => (
                                                <div key={index} className="text-xs text-red-600">
                                                    Row {error.row}: {error.field} - {error.message}
                                                    {error.value && ` (Value: ${error.value})`}
                                                </div>
                                            ))}
                                            {validation.errors.length > 20 && (
                                                <p className="text-xs text-muted-foreground italic">
                                                    ... and {validation.errors.length - 20} more errors
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Preview Table */}
                                {importedData.length > 0 && (
                                    <div className="border rounded-lg p-3 bg-white">
                                        <p className="font-medium text-sm mb-2">Preview ({importedData.length} valid records):</p>
                                        <div className="max-h-48 overflow-auto">
                                            <table className="w-full text-xs">
                                                <thead className="bg-slate-50 sticky top-0">
                                                    <tr>
                                                        {type === 'students' && (
                                                            <>
                                                                <th className="p-2 text-left">Name</th>
                                                                <th className="p-2 text-left">DOB</th>
                                                                <th className="p-2 text-left">Grade</th>
                                                                <th className="p-2 text-left">Guardian</th>
                                                            </>
                                                        )}
                                                        {type === 'classes' && (
                                                            <>
                                                                <th className="p-2 text-left">Class Name</th>
                                                                <th className="p-2 text-left">Grade</th>
                                                                <th className="p-2 text-left">Capacity</th>
                                                                <th className="p-2 text-left">Teacher</th>
                                                            </>
                                                        )}
                                                        {type === 'teachers' && (
                                                            <>
                                                                <th className="p-2 text-left">Name</th>
                                                                <th className="p-2 text-left">Email</th>
                                                                <th className="p-2 text-left">Role</th>
                                                                <th className="p-2 text-left">Phone</th>
                                                            </>
                                                        )}
                                                        {type === 'grading' && (
                                                            <>
                                                                <th className="p-2 text-left">Range</th>
                                                                <th className="p-2 text-left">Grade</th>
                                                                <th className="p-2 text-left">Point</th>
                                                                <th className="p-2 text-left">Status</th>
                                                            </>
                                                        )}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {importedData.slice(0, 10).map((item, index) => (
                                                        <tr key={index} className="border-t">
                                                            {type === 'students' && (
                                                                <>
                                                                    <td className="p-2">{item.firstName} {item.lastName}</td>
                                                                    <td className="p-2">{item.dateOfBirth}</td>
                                                                    <td className="p-2">{item.gradeLevel}</td>
                                                                    <td className="p-2">{item.guardianName || 'N/A'}</td>
                                                                </>
                                                            )}
                                                            {type === 'classes' && (
                                                                <>
                                                                    <td className="p-2">{item.className}</td>
                                                                    <td className="p-2">{item.gradeLevel}</td>
                                                                    <td className="p-2">{item.capacity}</td>
                                                                    <td className="p-2">{item.teacherName || 'N/A'}</td>
                                                                </>
                                                            )}
                                                            {type === 'teachers' && (
                                                                <>
                                                                    <td className="p-2">{item.firstName} {item.lastName}</td>
                                                                    <td className="p-2">{item.email}</td>
                                                                    <td className="p-2">{item.role}</td>
                                                                    <td className="p-2">{item.phone || 'N/A'}</td>
                                                                </>
                                                            )}
                                                            {type === 'grading' && item.ranges && item.ranges.map((range: any, rIndex: number) => (
                                                                <tr key={rIndex} className="border-t">
                                                                    <td className="p-2">{range.minScore}-{range.maxScore}</td>
                                                                    <td className="p-2">{range.letterGrade}</td>
                                                                    <td className="p-2">{range.gradePoint || 'N/A'}</td>
                                                                    <td className="p-2">{range.passFail}</td>
                                                                </tr>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            {importedData.length > 10 && (
                                                <p className="text-xs text-muted-foreground text-center mt-2">
                                                    ... and {importedData.length - 10} more records
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-8">
                        <div className="text-center space-y-4">
                            <FileSpreadsheet className="h-16 w-16 mx-auto text-green-600" />
                            <div>
                                <p className="font-medium">Ready to export {getTypeLabel().toLowerCase()}</p>
                                <p className="text-sm text-muted-foreground">
                                    Click the button below to download the Excel file
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    {mode === 'import' ? (
                        <Button
                            onClick={handleConfirmImport}
                            disabled={!validation || validation.validRows === 0 || importing}
                        >
                            Import {validation?.validRows || 0} Records
                        </Button>
                    ) : (
                        <Button onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Export to Excel
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
