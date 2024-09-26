

export const NodeService ={
    getTreeNodesData() {
        return [
            {
                key: '0',
                label: 'My Contracts',
                data: 'My Contracts',
                icon: 'pi pi-folder',
                children:[
                    {
                        key: '0-0',
                        label: 'Predective Maintenance Contracts',
                        data: 'Predective Maintenance Contracts',
                        icon: 'pi pi-folder',
                       
                    },
                    {
                        key: '0-1',
                        label: 'Insurance Contracts',
                        data: 'Insurance Contracts',
                        icon: 'pi pi-folder',
                       
                    },
                    {
                        key: '0-2',
                        label: 'Random',
                        data: 'Random',
                        icon: 'pi pi-folder', 
                    }
                ]
            },
            {
                key: '1',
                label: 'Shared contracts',
                data: 'Shared contracts',
                icon: 'pi pi-folder',
               
            },
            {
                key: '2',
                label: 'Team contracts',
                data: 'Team contracts',
                icon: 'pi pi-folder',
               
            }
        ];
    },
    getTreeNodes() {
        return Promise.resolve(this.getTreeNodesData());
    }
}