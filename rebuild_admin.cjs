const fs = require('fs');

let content = fs.readFileSync('src/components/AdminPanel.tsx', 'utf8');

content = content.replace('FileSpreadsheet,', 'Edit2,');
content = content.replace('export default function AdminPanel({\n  darkMode,', 'export default function AdminPanel({\n');
content = content.replace('  darkMode: boolean;\n', '');
content = content.replace('const gstCollected = totalRevenue * 0.05; // Representational 5% GST', '');
content = content.replace(/catch \(err: any\) \{/g, 'catch (_err: any) {');

const customState = `
  const [customAlert, setCustomAlert] = React.useState<{message: string, type: 'success'|'error'} | null>(null);
  const [confirmModal, setConfirmModal] = React.useState<{isOpen: boolean, message: string, onConfirm: () => void} | null>(null);
  const triggerAlert = (message: string, type: 'success' | 'error' = 'success') => {
    setCustomAlert({message, type});
    setTimeout(() => setCustomAlert(null), 3000);
  };
  const [editingProductId, setEditingProductId] = React.useState<string | null>(null);
`;
content = content.replace('const [activeSection, setActiveSection] = React.useState', customState + '\n  const [activeSection, setActiveSection] = React.useState');

const customUI = `
      {/* CUSTOM CONFIRM MODAL */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1a1a1a] p-8 border-4 border-black shadow-[12px_12px_0_0_#000] max-w-sm w-full space-y-6 text-center">
            <h3 className="text-2xl font-black uppercase tracking-tight text-black dark:text-white">Confirm Action</h3>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{confirmModal.message}</p>
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 p-3 border-2 border-black bg-white text-black font-black uppercase text-xs hover:bg-gray-100 transition-colors shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="flex-1 p-3 border-2 border-black bg-[#FFD400] text-black font-black uppercase text-xs hover:bg-[#FFC000] transition-colors shadow-[4px_4px_0_0_#000] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
              >
                Yes, OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM THEMED ALERT */}
      {customAlert && (
        <div className={\`fixed bottom-6 right-6 z-50 p-4 border-4 border-black \${customAlert.type === 'error' ? 'bg-[#FF4D4F]' : 'bg-[#FFD400]'} text-black shadow-[6px_6px_0_0_#000] font-mono animate-bounce\`}>
          <p className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
            {customAlert.type === 'error' ? '⚠️ ERROR' : '✅ SUCCESS'}
          </p>
          <p className="font-bold text-xs mt-1">{customAlert.message}</p>
        </div>
      )}
`;
content = content.replace(/<div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left text-black dark:text-white">/, `<div className="grid grid-cols-1 lg:grid-cols-4 gap-8 text-left text-black dark:text-white">` + customUI);

content = content.replace(/id: 'custom-' \+ Date\.now\(\)\.toString\(\),/g, `id: editingProductId || ('custom-' + Date.now().toString()),`);
content = content.replace(/setProducts\(\[item, \.\.\.products\]\);/, `if (editingProductId) {
          setProducts(products.map(p => p.id === editingProductId ? item : p));
          setEditingProductId(null);
          triggerAlert('Product successfully updated!');
        } else {
          setProducts([item, ...products]);
        }`);

content = content.replace(/{isUploading \? 'Uploading image\.\.\.' : 'Save Product to Database'}/, `{isUploading ? 'Uploading image...' : (editingProductId ? 'Update Product in Database' : 'Save Product to Database')}`);

const cancelEditBtn = `
              </button>
              {editingProductId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProductId(null);
                    setNewName('');
                    setNewCategory('Men');
                    setNewPrice('299');
                    setNewOrigPrice('699');
                    setNewImage('');
                    setNewImages([]);
                    setNewDesc('Premium fabric perfect for active styling.');
                    setNewMaterial('100% Breathable Cotton');
                  }}
                  className="w-full mt-2 p-3 border-2 border-black bg-white text-black font-black uppercase tracking-wider text-xs hover:bg-gray-100"
                >
                  Cancel Edit
                </button>
              )}
`;
content = content.replace(/<\/button>\s*<\/form>/, cancelEditBtn + '\n            </form>');

const editBtnUI = `
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          const prod = products.find(pr => pr.id === p.id);
                          if (prod) {
                            setEditingProductId(prod.id);
                            setNewName(prod.name);
                            setNewCategory(prod.category as any);
                            setNewPrice(prod.price.toString());
                            setNewOrigPrice((prod.originalPrice || '').toString());
                            setNewImage(prod.image);
                            setNewImages(prod.images || []);
                            setNewDesc(prod.description);
                            setNewMaterial(prod.material);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }}
                        className="p-2 border-2 border-black bg-white text-black hover:bg-[#FFD400] transition-all shrink-0"
                        title="Edit product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(p.id)}
                        className="p-2 border-2 border-black bg-[#FCE7F3] text-black hover:bg-[#FF4D4F] hover:text-white transition-all shrink-0"
                        title="Delist product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
`;
content = content.replace(/<button \s*onClick=\{\(\) => handleDeleteProduct\(p\.id\)\}[\s\S]*?<\/button>/, editBtnUI);

content = content.replace(/alert\(/g, '// alert(');
content = content.replace(/\/\/ alert\('Product successfully removed from database\.'\);/, "triggerAlert('Product successfully removed from database.');");
content = content.replace(/\/\/ alert\('Regional story deleted successfully\.'\);/, "triggerAlert('Regional story deleted successfully.');");
content = content.replace(/\/\/ alert\('Coupon deleted successfully\.'\);/, "triggerAlert('Coupon deleted successfully.');");

// Delete Product Confirm
const handleDelProdBefore = `  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delist this product?')) return;
    try {`;
const handleDelProdAfter = `  const handleDeleteProduct = (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delist this product?',
      onConfirm: async () => {
        try {`;
content = content.replace(handleDelProdBefore, handleDelProdAfter);
content = content.replace(
`} catch (_err: any) {
      // alert('Error deleting product: ' + err.message);
    }
  };

  const handleUpdateStatus`,
`} catch (_err: any) {
          // alert('Error deleting product: ' + _err.message);
        }
      }
    });
  };

  const handleUpdateStatus`
);

// Remove Coupon Confirm
const handleRemCoupBefore = `  const handleRemoveCoupon = async (code: string) => {
    if (!confirm(\`Are you sure you want to remove coupon \${code}?\`)) return;
    try {`;
const handleRemCoupAfter = `  const handleRemoveCoupon = (code: string) => {
    setConfirmModal({
      isOpen: true,
      message: \`Are you sure you want to remove coupon \${code}?\`,
      onConfirm: async () => {
        try {`;
content = content.replace(handleRemCoupBefore, handleRemCoupAfter);
content = content.replace(
`} catch (_err: any) {
      // alert('Error deleting coupon: ' + err.message);
    }
  };

  const handleSendNotif`,
`} catch (_err: any) {
          // alert('Error deleting coupon: ' + _err.message);
        }
      }
    });
  };

  const handleSendNotif`
);

// Delete Story Confirm
const handleDelStoryBefore = `  const handleDeleteStory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this regional story?')) return;
    try {`;
const handleDelStoryAfter = `  const handleDeleteStory = (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete this regional story?',
      onConfirm: async () => {
        try {`;
content = content.replace(handleDelStoryBefore, handleDelStoryAfter);
content = content.replace(
`} catch (_err: any) {
      // alert('Error deleting story: ' + err.message);
    }
  };

  // Safe calculators`,
`} catch (_err: any) {
          // alert('Error deleting story: ' + _err.message);
        }
      }
    });
  };

  // Safe calculators`
);

// Fix unused 'err' variables
content = content.replace(/console\.error\(err\);/g, 'console.error(_err);');
content = content.replace(/reject\(err\);/g, 'reject(_err);');
content = content.replace(/const err = await res\.json\(\);\n\s*\/\/ alert/g, '// const err = await res.json();\n        // alert');

// Leave 'err' around line 116 uncommented since it's used right after:
// } else {
//   const err = await res.json();
//   reject(new Error(err.error || 'Server error'));
// }
// (My replacement above specifically targets ones followed by // alert)

fs.writeFileSync('src/components/AdminPanel.tsx', content);
console.log('Successfully rebuilt AdminPanel!');
