import { useState } from 'react'
import { Container } from '@components/ui'
import ProductForm, { store } from './Form'
import ProductTable from './Table'
import { snapshot } from 'valtio'

const ProductView = (props) => {
  const [products] = useState(props.products || [])
  const [hideProductModal, setHideProductModal] = useState(true)

  return (
    <Container>
      <div className="mb-12 transition ease-in duration-75">
        <h1 className="flex-auto text-xl font-semibold">Products</h1>
        <AddProductModal
          hide={hideProductModal}
          closeModal={() => setHideProductModal(true)}
        />
        {products.length > 0
          ? (
          <div className="my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <ProductTable products={products} />
          </div>
            )
          : (
          <ProductEmpty />
            )}
        <button
          onClick={() => setHideProductModal(false)}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Add Product
        </button>
      </div>
    </Container>
  )
}

export default ProductView

const ProductEmpty = () => (
  <Container>
    <div className="my-6">You haven't added any products.</div>
  </Container>
)

const AddProductModal = ({ hide, closeModal }) => {
  const addProduct = async () => {
    const product = snapshot(store)
    const { data } = await fetch('/api/vendor/product', {
      method: 'post',
      body: JSON.stringify({
        name: product.name,
        order_quantity_minimum: product.order_quantity_minimum,
        price: product.price
      })
    }).then((r) => r.json())
    await fetch(`/api/vendor/custom-field?id=${data.id}`, {
      method: 'post',
      body: JSON.stringify({
        name: 'Trial Rolls Offered',
        value: product.trialRollsOffered
      })
    }).then((r) => r.json())
    await fetch(`/api/vendor/custom-field?id=${data.id}`, {
      method: 'post',
      body: JSON.stringify({
        name: 'Units',
        value: product.units
      })
    }).then((r) => r.json())
    closeModal(true)
  }

  if (hide) return null
  return (
    <div className={'fixed z-40 inset-0 overflow-y-auto'}>
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>
        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <form
            onSubmit={(e: any) => {
              e.preventDefault()
              addProduct()
            }}
          >
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-headline"
                  >
                    Add New Product
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Please fill in all of the fields to add a new product.
                    </p>
                    <ProductForm product={{}} />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Add
              </button>
              <button
                onClick={() => closeModal(true)}
                type="reset"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
