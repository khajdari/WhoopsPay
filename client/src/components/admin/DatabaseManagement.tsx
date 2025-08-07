import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Database, 
  RefreshCw, 
  Plus, 
  Edit, 
  Save, 
  X, 
  Trash2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface TableInfo {
  name: string;
  columns: Array<{
    name: string;
    type: string;
    nullable: boolean;
    primaryKey: boolean;
  }>;
  rowCount: number;
}



export function DatabaseManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any[]>([]);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editRowData, setEditRowData] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRow, setNewRow] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<{[key: number]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tables
  const { data: tables, isLoading: tablesLoading, refetch: refetchTables } = useQuery({
    queryKey: ['/api/admin/database/tables'],
    retry: false,
  });

  // Fetch table data
  const { data: tableData, isLoading: tableDataLoading, refetch: refetchTableData } = useQuery({
    queryKey: [`/api/admin/database/table/${selectedTable}`],
    enabled: !!selectedTable,
    retry: false,
  });





  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
  };

  const handleEditRow = (rowIndex: number, rowData: any[]) => {
    setEditingRow(rowIndex);
    setEditingData([...rowData]);
  };

  const handleSaveRow = async () => {
    if (!selectedTable || !tableData?.columns || editingRow === null) return;
    
    try {
      const columns = tableData.columns;
      const primaryKeyCol = tables?.find((t: TableInfo) => t.name === selectedTable)?.columns.find(col => col.primaryKey);
      
      if (!primaryKeyCol) {
        toast({
          title: "Error",
          description: "Cannot update row: No primary key found",
          variant: "destructive",
        });
        return;
      }
      
      const primaryKeyIndex = columns.indexOf(primaryKeyCol.name);
      const primaryKeyValue = tableData.rows[editingRow][primaryKeyIndex];
      
      const setClauses = columns.map((col, idx) => {
        if (idx === primaryKeyIndex) return null;
        const value = editingData[idx];
        return `${col} = ${typeof value === 'string' ? `'${value.replace(/'/g, "''")}'` : value}`;
      }).filter(Boolean);
      
      const updateQuery = `UPDATE ${selectedTable} SET ${setClauses.join(', ')} WHERE ${primaryKeyCol.name} = ${typeof primaryKeyValue === 'string' ? `'${primaryKeyValue}'` : primaryKeyValue}`;
      
      await executeQueryMutation.mutateAsync(updateQuery);
      refetchTableData();
      
      toast({
        title: "Row Updated",
        description: "Row has been updated successfully",
      });
      setEditingRow(null);
      setEditingData([]);
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update row",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRow = async (rowIndex: number) => {
    if (!selectedTable || !tableData?.columns) return;
    
    try {
      const primaryKeyCol = tables?.find((t: TableInfo) => t.name === selectedTable)?.columns.find(col => col.primaryKey);
      
      if (!primaryKeyCol) {
        toast({
          title: "Error",
          description: "Cannot delete row: No primary key found",
          variant: "destructive",
        });
        return;
      }
      
      const primaryKeyIndex = tableData.columns.indexOf(primaryKeyCol.name);
      const primaryKeyValue = tableData.rows[rowIndex][primaryKeyIndex];
      
      const deleteQuery = `DELETE FROM ${selectedTable} WHERE ${primaryKeyCol.name} = ${typeof primaryKeyValue === 'string' ? `'${primaryKeyValue}'` : primaryKeyValue}`;
      
      await executeQueryMutation.mutateAsync(deleteQuery);
      refetchTableData();
      
      toast({
        title: "Row Deleted",
        description: "Row has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete row",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingRow(null);
    setEditingData([]);
  };

  const validateForm = (data: any[], columns: any[]) => {
    const errors: {[key: number]: string} = {};
    
    columns.forEach((col, idx) => {
      const value = data[idx]?.toString().trim();
      
      // Check required fields
      if (!col.nullable && (!value || value === '')) {
        errors[idx] = `${col.name} is required`;
        return;
      }
      
      // Type validation
      if (value && value !== '') {
        switch (col.type.toLowerCase()) {
          case 'integer':
            if (!/^\d+$/.test(value)) {
              errors[idx] = `${col.name} must be a valid integer`;
            }
            break;
          case 'real':
            if (!/^\d*\.?\d+$/.test(value)) {
              errors[idx] = `${col.name} must be a valid number`;
            }
            break;
          case 'text':
            if (value.length > 500) {
              errors[idx] = `${col.name} must be less than 500 characters`;
            }
            break;
        }
      }
    });
    
    return errors;
  };

  const handleSaveEditedRow = async () => {
    if (!selectedTable || !tableData?.columns || editingRow === null) return;
    
    setIsSubmitting(true);
    
    try {
      const columns = tableData.columns;
      const tableInfo = tables?.find((t: TableInfo) => t.name === selectedTable);
      const primaryKeyCol = tableInfo?.columns.find(col => col.primaryKey);
      
      // Validate form
      const validationErrors = validateForm(editRowData, tableInfo?.columns || []);
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }
      
      setFormErrors({});
      
      if (!primaryKeyCol) {
        toast({
          title: "Error",
          description: "Cannot update row: No primary key found",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const originalRow = tableData.rows?.[editingRow];
      const primaryKeyIndex = columns.findIndex((col: any) => col === primaryKeyCol.name);
      const primaryKeyValue = originalRow[primaryKeyIndex];

      const setClauses = editRowData.map((value, idx) => 
        `${columns[idx]} = ?`
      ).join(', ');

      const updateQuery = `UPDATE ${selectedTable} SET ${setClauses} WHERE ${primaryKeyCol.name} = ?`;
      
      await executeQueryMutation.mutateAsync(updateQuery + ` -- Values: [${editRowData.map(v => `'${v}'`).join(', ')}, '${primaryKeyValue}']`);
      
      await refetchTableData();
      setShowEditDialog(false);
      setEditingRow(null);
      setEditRowData([]);
      
      toast({
        title: "Success",
        description: "Row updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update row",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveNewRow = async () => {
    if (!selectedTable || !newRow.length) return;
    
    setIsSubmitting(true);
    
    try {
      const tableInfo = tables?.find((t: TableInfo) => t.name === selectedTable);
      const columns = tableInfo?.columns;
      if (!columns) {
        setIsSubmitting(false);
        return;
      }
      
      // Validate form
      const validationErrors = validateForm(newRow, columns);
      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }
      
      setFormErrors({});
      
      const columnNames = columns.map(col => col.name);
      const values = newRow.map(val => 
        typeof val === 'string' ? `'${val.replace(/'/g, "''")}'` : val
      );
      
      const insertQuery = `INSERT INTO ${selectedTable} (${columnNames.join(', ')}) VALUES (${values.join(', ')})`;
      
      await executeQueryMutation.mutateAsync(insertQuery);
      refetchTableData();
      setShowAddDialog(false);
      setNewRow([]);
      
      toast({
        title: "Row Added",
        description: "New row has been added successfully",
      });
    } catch (error) {
      toast({
        title: "Insert Failed",
        description: "Failed to add new row",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const exportQueryResults = () => {
    if (!queryResult?.columns || !queryResult?.rows) return;
    
    const csvContent = [
      queryResult.columns.join(','),
      ...queryResult.rows.map((row: any[]) => 
        row.map(cell => 
          typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'query_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Management
            <Badge variant="destructive" className="ml-auto">Admin Only</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tables List */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Tables</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              {tablesLoading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : (
                <div className="space-y-2">
                  {tables?.map((table: TableInfo) => (
                    <div
                      key={table.name}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedTable === table.name
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTableSelect(table.name)}
                    >
                      <div className="font-medium">{table.name}</div>
                      <div className="text-xs text-gray-500">
                        {table.rowCount} rows
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Table Data */}
        <div className="lg:col-span-3">
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>
                  {selectedTable ? `${selectedTable} Data` : 'Select a Table'}
                </span>
                {selectedTable && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refetchTableData()}
                      disabled={tableDataLoading}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${tableDataLoading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAddDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Row
                    </Button>
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTable ? (
                tableDataLoading ? (
                  <div className="flex items-center justify-center h-96">
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  </div>
                ) : tableData?.rows && tableData.rows.length > 0 ? (
                  <ScrollArea className="h-96">
                    <div className="space-y-3">
                      {tableData.rows?.map((row: any, rowIdx: number) => (
                        <div key={rowIdx} className="border rounded-lg p-4 bg-white hover:bg-gray-50">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              {row.map((cell: any, cellIdx: number) => (
                                <div key={cellIdx} className="min-w-0">
                                  <div className="text-xs font-medium text-gray-500 mb-1">
                                    {tableData.columns?.[cellIdx]}
                                  </div>
                                  <div className="text-sm text-gray-900 break-words">
                                    {String(cell)}
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex flex-col gap-2 ml-4">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setEditRowData([...row]);
                                  setEditingRow(rowIdx);
                                  setShowEditDialog(true);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
                              >
                                Edit Row
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteRow(rowIdx)}
                                className="border-red-300 text-red-600 hover:bg-red-50 px-4 py-2"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex items-center justify-center h-96 text-gray-500">
                    No data available
                  </div>
                )
              ) : (
                <div className="flex items-center justify-center h-96 text-gray-500">
                  Select a table to view data
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>



      {/* Add Row Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-blue-200">
          <DialogHeader className="pb-6 border-b border-blue-100">
            <DialogTitle className="text-2xl font-bold text-center text-[hsl(var(--whoopspay-blue))]">
              💎 Add New Database Record
            </DialogTitle>
            <p className="text-center text-gray-600 mt-2">
              Creating new entry in <span className="font-bold text-[hsl(var(--whoopspay-darkblue))]">{selectedTable}</span> table
            </p>
          </DialogHeader>
          
          <div className="bg-gradient-to-br from-blue-50/70 to-sky-50/70 rounded-xl p-6 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tables?.find((t: TableInfo) => t.name === selectedTable)?.columns.map((col: any, idx: number) => (
                <div key={idx} className="space-y-3">
                  <Label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--whoopspay-blue))]"></div>
                    {col.name}
                    <span className="text-xs text-white bg-[hsl(var(--whoopspay-gold))] px-3 py-1 rounded-full font-semibold">
                      {col.type}
                    </span>
                    {!col.nullable && <span className="text-red-600 text-sm font-bold">*</span>}
                  </Label>
                  <Input
                    value={newRow[idx] || ''}
                    onChange={(e) => {
                      const updatedRow = [...newRow];
                      updatedRow[idx] = e.target.value;
                      setNewRow(updatedRow);
                      // Clear error when user types
                      if (formErrors[idx]) {
                        const newErrors = { ...formErrors };
                        delete newErrors[idx];
                        setFormErrors(newErrors);
                      }
                    }}
                    placeholder={col.nullable ? 'Optional field' : 'Required field'}
                    className={`border-2 transition-all duration-200 ${
                      formErrors[idx] 
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                        : 'border-blue-200 focus:border-[hsl(var(--whoopspay-blue))] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors[idx] && (
                    <p className="text-red-600 text-sm font-semibold flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {formErrors[idx]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-4 pt-8 justify-center">
              <Button 
                onClick={handleSaveNewRow}
                disabled={isSubmitting}
                className="bg-[hsl(var(--whoopspay-blue))] hover:bg-[hsl(var(--whoopspay-darkblue))] text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-bold text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Create Record
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false);
                  setFormErrors({});
                }}
                disabled={isSubmitting}
                className="border-2 border-[hsl(var(--whoopspay-blue))] text-[hsl(var(--whoopspay-blue))] hover:bg-[hsl(var(--whoopspay-blue))] hover:text-white px-8 py-3 rounded-xl transition-all duration-200 font-bold"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Row Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-2 border-blue-200">
          <DialogHeader className="pb-6 border-b border-blue-100">
            <DialogTitle className="text-2xl font-bold text-center text-[hsl(var(--whoopspay-blue))]">
              🔧 Edit Database Record
            </DialogTitle>
            <p className="text-center text-gray-600 mt-2">
              Modifying entry in <span className="font-bold text-[hsl(var(--whoopspay-darkblue))]">{selectedTable}</span> table
            </p>
          </DialogHeader>
          
          <div className="bg-gradient-to-br from-blue-50/70 to-sky-50/70 rounded-xl p-6 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tables?.find((t: TableInfo) => t.name === selectedTable)?.columns.map((col: any, idx: number) => (
                <div key={idx} className="space-y-3">
                  <Label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[hsl(var(--whoopspay-blue))]"></div>
                    {col.name}
                    <span className="text-xs text-white bg-[hsl(var(--whoopspay-gold))] px-3 py-1 rounded-full font-semibold">
                      {col.type}
                    </span>
                    {!col.nullable && <span className="text-red-600 text-sm font-bold">*</span>}
                  </Label>
                  <Input
                    value={editRowData[idx] || ''}
                    onChange={(e) => {
                      const updatedRow = [...editRowData];
                      updatedRow[idx] = e.target.value;
                      setEditRowData(updatedRow);
                      // Clear error when user types
                      if (formErrors[idx]) {
                        const newErrors = { ...formErrors };
                        delete newErrors[idx];
                        setFormErrors(newErrors);
                      }
                    }}
                    placeholder={col.nullable ? 'Optional field' : 'Required field'}
                    className={`border-2 transition-all duration-200 ${
                      formErrors[idx] 
                        ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100' 
                        : 'border-blue-200 focus:border-[hsl(var(--whoopspay-blue))] focus:ring-2 focus:ring-blue-100'
                    }`}
                  />
                  {formErrors[idx] && (
                    <p className="text-red-600 text-sm font-semibold flex items-center gap-1">
                      <span className="text-red-500">⚠</span>
                      {formErrors[idx]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-4 pt-8 justify-center">
              <Button 
                onClick={handleSaveEditedRow}
                disabled={isSubmitting}
                className="bg-[hsl(var(--whoopspay-blue))] hover:bg-[hsl(var(--whoopspay-darkblue))] text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-bold text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Update Record
                  </>
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowEditDialog(false);
                  setFormErrors({});
                }}
                disabled={isSubmitting}
                className="border-2 border-[hsl(var(--whoopspay-blue))] text-[hsl(var(--whoopspay-blue))] hover:bg-[hsl(var(--whoopspay-blue))] hover:text-white px-8 py-3 rounded-xl transition-all duration-200 font-bold"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}