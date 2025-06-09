import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Database, Play, Download, Trash2, Eye, Plus, AlertTriangle, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [sqlQuery, setSqlQuery] = useState<string>('');
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [newTableSchema, setNewTableSchema] = useState('');

  // Fetch database schema
  const { data: tables, isLoading: tablesLoading, refetch: refetchTables } = useQuery({
    queryKey: ['/api/admin/database/tables'],
    retry: false,
  });

  // Fetch table data
  const { data: tableData, isLoading: tableDataLoading } = useQuery({
    queryKey: ['/api/admin/database/table', selectedTable],
    enabled: !!selectedTable,
    retry: false,
  });

  // Execute SQL query mutation
  const executeSqlMutation = useMutation({
    mutationFn: async (query: string) => {
      return await apiRequest('/api/admin/database/execute', 'POST', { query });
    },
    onSuccess: (data) => {
      setQueryResult(data);
      if (data.error) {
        toast({
          title: "SQL Error",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Query Executed",
          description: `${data.rowsAffected || data.rows?.length || 0} rows affected/returned`,
        });
        // Refresh tables if it was a DDL operation
        if (sqlQuery.trim().toLowerCase().startsWith('create') || 
            sqlQuery.trim().toLowerCase().startsWith('drop') ||
            sqlQuery.trim().toLowerCase().startsWith('alter')) {
          refetchTables();
        }
        // Refresh table data if we're viewing a table
        if (selectedTable) {
          queryClient.invalidateQueries({ queryKey: ['/api/admin/database/table', selectedTable] });
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create table mutation
  const createTableMutation = useMutation({
    mutationFn: async (schema: string) => {
      return await apiRequest('/api/admin/database/execute', 'POST', { 
        query: `CREATE TABLE ${schema}` 
      });
    },
    onSuccess: () => {
      toast({
        title: "Table Created",
        description: "New table created successfully",
      });
      setNewTableSchema('');
      refetchTables();
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Drop table mutation
  const dropTableMutation = useMutation({
    mutationFn: async (tableName: string) => {
      return await apiRequest('/api/admin/database/execute', 'POST', { 
        query: `DROP TABLE IF EXISTS ${tableName}` 
      });
    },
    onSuccess: () => {
      toast({
        title: "Table Dropped",
        description: "Table deleted successfully",
      });
      setSelectedTable('');
      refetchTables();
    },
    onError: (error) => {
      toast({
        title: "Drop Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExecuteQuery = () => {
    if (!sqlQuery.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a SQL query",
        variant: "destructive",
      });
      return;
    }
    executeSqlMutation.mutate(sqlQuery);
  };

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setSqlQuery(`SELECT * FROM ${tableName} LIMIT 100;`);
  };

  const handleQuickQuery = (query: string) => {
    setSqlQuery(query);
  };

  const exportTableData = (tableName: string) => {
    if (tableData?.rows) {
      const csv = [
        tableData.columns.join(','),
        ...tableData.rows.map((row: any[]) => row.map((cell: any) => 
          typeof cell === 'string' ? `"${cell.replace(/"/g, '""')}"` : cell
        ).join(','))
      ].join('\n');
      
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tableName}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Card className="bg-slate-800 border border-slate-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Database Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="explorer" className="space-y-4">
          <TabsList className="bg-slate-700 border border-slate-600">
            <TabsTrigger value="explorer" className="data-[state=active]:bg-cyan-400 data-[state=active]:text-black">
              Explorer
            </TabsTrigger>
            <TabsTrigger value="query" className="data-[state=active]:bg-cyan-400 data-[state=active]:text-black">
              SQL Query
            </TabsTrigger>
            <TabsTrigger value="management" className="data-[state=active]:bg-cyan-400 data-[state=active]:text-black">
              Management
            </TabsTrigger>
          </TabsList>

          {/* Database Explorer */}
          <TabsContent value="explorer" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Tables List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold">Database Tables</h4>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => refetchTables()}
                    className="border-gray-500 text-gray-300 hover:bg-slate-600"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
                
                {tablesLoading ? (
                  <p className="text-gray-400">Loading tables...</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {tables?.map((table: TableInfo) => (
                      <div
                        key={table.name}
                        className={`p-3 rounded cursor-pointer transition-colors ${
                          selectedTable === table.name
                            ? 'bg-yellow-400/20 border border-yellow-400/40'
                            : 'bg-slate-700 hover:bg-slate-600'
                        }`}
                        onClick={() => handleTableSelect(table.name)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-white font-medium">{table.name}</span>
                          <span className="text-gray-400 text-sm">{table.rowCount} rows</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Table Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold">
                    {selectedTable ? `Table: ${selectedTable}` : 'Select a Table'}
                  </h4>
                  {selectedTable && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => exportTableData(selectedTable)}
                        className="bg-cyan-400 hover:bg-cyan-300 text-black"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleQuickQuery(`SELECT * FROM ${selectedTable};`)}
                        className="border-gray-500 text-gray-300 hover:bg-slate-600"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View All
                      </Button>
                    </div>
                  )}
                </div>

                {!selectedTable ? (
                  <p className="text-gray-400">Select a table from the list to view its structure and data</p>
                ) : tableDataLoading ? (
                  <p className="text-gray-400">Loading table data...</p>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {/* Table Schema */}
                    <div>
                      <h5 className="text-gray-300 font-medium mb-2">Schema</h5>
                      <div className="bg-slate-700 rounded p-2 overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-slate-600">
                              <th className="text-left text-gray-300 p-1">Column</th>
                              <th className="text-left text-gray-300 p-1">Type</th>
                              <th className="text-left text-gray-300 p-1">PK</th>
                            </tr>
                          </thead>
                          <tbody>
                            {tables?.find((t: TableInfo) => t.name === selectedTable)?.columns.map((col: any, idx: number) => (
                              <tr key={idx} className="border-b border-slate-600">
                                <td className="p-1 text-white">{col.name}</td>
                                <td className="p-1 text-gray-300">{col.type}</td>
                                <td className="p-1 text-gray-300">{col.primaryKey ? '✓' : ''}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Sample Data */}
                    <div>
                      <h5 className="text-gray-300 font-medium mb-2">Sample Data</h5>
                      <div className="bg-slate-700 rounded p-2 overflow-x-auto">
                        {tableData?.rows?.length ? (
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-slate-600">
                                {tableData.columns.map((col: string, idx: number) => (
                                  <th key={idx} className="text-left text-gray-300 p-1">{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tableData.rows.slice(0, 5).map((row: any[], idx: number) => (
                                <tr key={idx} className="border-b border-slate-600">
                                  {row.map((cell: any, cellIdx: number) => (
                                    <td key={cellIdx} className="p-1 text-white max-w-20 truncate">
                                      {cell === null ? (
                                        <span className="text-gray-500 italic">NULL</span>
                                      ) : (
                                        String(cell)
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-gray-400">No data found</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* SQL Query */}
          <TabsContent value="query" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Query Input */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">SQL Query</Label>
                  <Textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    placeholder="Enter your SQL query here..."
                    className="bg-slate-700 border-slate-600 text-white font-mono min-h-[150px]"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleExecuteQuery}
                    disabled={executeSqlMutation.isPending}
                    className="bg-cyan-400 hover:bg-cyan-300 text-black"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Execute
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSqlQuery('')}
                    className="border-gray-500 text-gray-300 hover:bg-slate-600"
                  >
                    Clear
                  </Button>
                </div>

                {/* Quick Query Templates */}
                <div className="space-y-2">
                  <Label className="text-gray-300">Quick Queries</Label>
                  <div className="grid grid-cols-1 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuery('SELECT name FROM sqlite_master WHERE type="table";')}
                      className="text-left justify-start border-gray-500 text-gray-300 hover:bg-slate-600 h-8"
                    >
                      Show all tables
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuery('SELECT * FROM users LIMIT 10;')}
                      className="text-left justify-start border-gray-500 text-gray-300 hover:bg-slate-600 h-8"
                    >
                      Show users
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickQuery('SELECT * FROM transactions ORDER BY createdAt DESC LIMIT 10;')}
                      className="text-left justify-start border-gray-500 text-gray-300 hover:bg-slate-600 h-8"
                    >
                      Recent transactions
                    </Button>
                  </div>
                </div>
              </div>

              {/* Query Results */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold">Query Results</h4>
                {!queryResult ? (
                  <p className="text-gray-400">Execute a query to see results</p>
                ) : queryResult.error ? (
                  <div className="bg-red-900/20 border border-red-500/40 rounded p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 font-semibold">SQL Error</span>
                    </div>
                    <p className="text-red-300 font-mono text-sm">{queryResult.error}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-sm">
                        {queryResult.rows ? `${queryResult.rows.length} rows returned` : `${queryResult.rowsAffected || 0} rows affected`}
                      </span>
                    </div>
                    
                    {queryResult.rows && queryResult.rows.length > 0 && (
                      <div className="bg-slate-700 rounded p-2 overflow-x-auto max-h-60">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b border-slate-600">
                              {queryResult.columns.map((col, idx) => (
                                <th key={idx} className="text-left text-gray-300 p-1">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {queryResult.rows.map((row, idx) => (
                              <tr key={idx} className="border-b border-slate-600">
                                {row.map((cell, cellIdx) => (
                                  <td key={cellIdx} className="p-1 text-white max-w-24 truncate">
                                    {cell === null ? (
                                      <span className="text-gray-500 italic">NULL</span>
                                    ) : (
                                      String(cell)
                                    )}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Table Management */}
          <TabsContent value="management" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Create Table */}
              <div className="space-y-4">
                <h4 className="text-white font-semibold">Create New Table</h4>
                <div className="space-y-2">
                  <Label className="text-gray-300">Table Schema</Label>
                  <Textarea
                    value={newTableSchema}
                    onChange={(e) => setNewTableSchema(e.target.value)}
                    placeholder="example_table (&#10;  id INTEGER PRIMARY KEY AUTOINCREMENT,&#10;  name TEXT NOT NULL,&#10;  created_at DATETIME DEFAULT CURRENT_TIMESTAMP&#10;)"
                    className="bg-slate-700 border-slate-600 text-white font-mono min-h-[120px]"
                  />
                </div>
                
                <Button
                  onClick={() => createTableMutation.mutate(newTableSchema)}
                  disabled={createTableMutation.isPending || !newTableSchema.trim()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Table
                </Button>
              </div>

              {/* Danger Zone */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <h4 className="text-red-400 font-semibold">Danger Zone</h4>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Drop Table</Label>
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue placeholder="Select table to drop" />
                    </SelectTrigger>
                    <SelectContent>
                      {tables?.map((table: TableInfo) => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button
                  onClick={() => {
                    if (selectedTable && confirm(`Are you sure you want to drop table "${selectedTable}"? This action cannot be undone.`)) {
                      dropTableMutation.mutate(selectedTable);
                    }
                  }}
                  disabled={dropTableMutation.isPending || !selectedTable}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Drop Table
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}