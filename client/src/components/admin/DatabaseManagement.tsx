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
  Play, 
  Download, 
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

interface QueryResult {
  columns: string[];
  rows: any[][];
  rowsAffected?: number;
  error?: string;
}

export function DatabaseManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM users LIMIT 10;");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editingData, setEditingData] = useState<any[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newRow, setNewRow] = useState<any[]>([]);

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

  // Execute SQL query mutation
  const executeQueryMutation = useMutation({
    mutationFn: async (query: string) => {
      return await apiRequest('/api/admin/database/execute', 'POST', { query });
    },
    onSuccess: (data) => {
      setQueryResult(data);
      if (sqlQuery.toLowerCase().includes('create') || sqlQuery.toLowerCase().includes('drop')) {
        refetchTables();
      }
    },
    onError: (error: any) => {
      setQueryResult({
        columns: ['error'],
        rows: [[error.message || 'Query execution failed']],
        error: error.message || 'Query execution failed'
      });
    },
  });

  const handleExecuteQuery = () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a SQL query",
        variant: "destructive",
      });
      return;
    }
    executeQueryMutation.mutate(sqlQuery);
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setSqlQuery(`SELECT * FROM ${tableName} LIMIT 50;`);
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

  const handleSaveNewRow = async () => {
    if (!selectedTable || !newRow.length) return;
    
    try {
      const columns = tables?.find((t: TableInfo) => t.name === selectedTable)?.columns;
      if (!columns) return;
      
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
                    <div className="border rounded bg-white overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            {tableData.columns?.map((col: any, idx: number) => (
                              <th key={idx} className="p-3 text-left font-medium border-r">
                                {col}
                              </th>
                            ))}
                            <th className="p-3 text-left font-medium w-32">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData.rows?.map((row: any, rowIdx: number) => (
                            <tr key={rowIdx} className="border-b hover:bg-gray-50">
                              {row.map((cell: any, cellIdx: number) => (
                                <td key={cellIdx} className="p-3 border-r text-sm">
                                  {editingRow === rowIdx ? (
                                    <Input
                                      value={editingData[cellIdx] || ''}
                                      onChange={(e) => {
                                        const newData = [...editingData];
                                        newData[cellIdx] = e.target.value;
                                        setEditingData(newData);
                                      }}
                                      className="h-8 text-sm"
                                    />
                                  ) : (
                                    <div className="truncate max-w-xs">{String(cell)}</div>
                                  )}
                                </td>
                              ))}
                              <td className="p-3 w-32">
                                {editingRow === rowIdx ? (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      onClick={handleSaveRow}
                                      disabled={executeQueryMutation.isPending}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={handleCancelEdit}
                                      className="h-8 w-8 p-0"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleEditRow(rowIdx, row)}
                                      className="h-8 w-8 p-0"
                                      title="Edit Row"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteRow(rowIdx)}
                                      className="h-8 w-8 p-0"
                                      title="Delete Row"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
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

      {/* SQL Query Executor */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Play className="w-5 h-5" />
            SQL Query Executor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter your SQL query here..."
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            className="font-mono text-sm min-h-32"
          />
          
          <div className="flex gap-2">
            <Button
              onClick={handleExecuteQuery}
              disabled={executeQueryMutation.isPending}
            >
              <Play className="h-4 w-4 mr-2" />
              Execute Query
            </Button>
            {queryResult && !queryResult.error && (
              <Button
                variant="outline"
                onClick={exportQueryResults}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Results
              </Button>
            )}
          </div>

          {/* Query Results */}
          {queryResult && (
            <div className="border rounded p-4 bg-gray-50">
              {queryResult.error ? (
                <div className="text-red-600 font-mono text-sm">
                  Error: {queryResult.error}
                </div>
              ) : (
                <div>
                  {queryResult.rowsAffected !== undefined ? (
                    <div className="text-green-600 font-medium">
                      Query executed successfully. {queryResult.rowsAffected} rows affected.
                    </div>
                  ) : (
                    <div>
                      <div className="text-green-600 font-medium mb-2">
                        Query executed successfully. {queryResult.rows?.length || 0} rows returned.
                      </div>
                      {queryResult.columns && queryResult.rows && (
                        <ScrollArea className="h-64">
                          <div className="border rounded bg-white">
                            <div className="grid bg-gray-100 border-b" style={{ gridTemplateColumns: `repeat(${queryResult.columns.length}, minmax(120px, 1fr))` }}>
                              {queryResult.columns.map((col: any, idx: number) => (
                                <div key={idx} className="p-2 font-medium border-r last:border-r-0">
                                  {col}
                                </div>
                              ))}
                            </div>
                            {queryResult.rows.map((row: any, rowIdx: number) => (
                              <div key={rowIdx} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: `repeat(${queryResult.columns.length}, minmax(120px, 1fr))` }}>
                                {row.map((cell: any, cellIdx: number) => (
                                  <div key={cellIdx} className="p-2 border-r last:border-r-0 text-sm">
                                    <div className="truncate">{String(cell)}</div>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Row Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Row to {selectedTable}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {tables?.find((t: TableInfo) => t.name === selectedTable)?.columns.map((col: any, idx: number) => (
              <div key={idx}>
                <Label>{col.name} ({col.type})</Label>
                <Input
                  value={newRow[idx] || ''}
                  onChange={(e) => {
                    const updatedRow = [...newRow];
                    updatedRow[idx] = e.target.value;
                    setNewRow(updatedRow);
                  }}
                  placeholder={col.nullable ? 'Optional' : 'Required'}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveNewRow}>
                <Save className="h-4 w-4 mr-2" />
                Save Row
              </Button>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}