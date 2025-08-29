GENERAL NOTE: this backend uses cookies to store jwt
you will have to install cookie-parser (npm i cookie-parser), \

it also uses multer for image upload. endpoint being 
1 - /addProduct
2 - /updateProduct/:productId 

and fields being "product-image"


USERS ENDPOINTS
.....................................................
    /createUser - for creating new users
    Content-Type is application/json
    body - {"email":"youremail", "password":"yourPAssword"}

    /getAllUsers - for getting all registered user. must be an admin and must be logged in



LOGIN ENDPOINTS
.....................................................
/login - for logging in - "credentials":"include" should be included in the fetch(url, {"credentials":"include"}) from the front end

Content-Type is JSON
body - {"email":"youremail", "password":"yourPassword"}

/logout - for logging out

/forgotPassword - this endpoint recieves "email" when user from the frontend clicks forgot password enters email and submits it
body - {"email":"youremail"}
password reset link is sent to the email if found.
NB: as a developer, you will have to get the frontend url of which you will send the together with the 
jwt generated as a query parameter. take a look at this endpoint.

returns
{ message: "email sent"}


/passwordReset - this endpoint receives the new password
body - {"newPassword":"your new password"}
Content-Type is application/json

returns
{message:"password reset successfully, now login"};




PRODUCT MANAGEMENT ENPOINT
.....................................................
    FETCHING PRODUCTS - 
    endpoint - /getProducts 
    type - GET

    returns
    {
        products: products,
        message: `${products.length} fetched successfully`,
    }


    FETCHING PARTICULAR PRODUCT- 
    endpoint - /productPage/:productId
    type - GET
    example usage: /productPage/24345423r2

    returns

    {
        product: product,
        message: `product fetched successfully`,
    }



    ADDING PRODUCT TO DATABASE - user must logged in and must be an admin for permission concerns

    endpoint - /addProduct
    type - POST
    Content-Type is multipart/formData
    photo field in the form element should be "product-image"

    returns

    { 
        newProduct: newProduct, 
        message: "added successfully" 
    }



    UPDATING PRODUCT -user must be logged in, the owner of the product, the admin before he can update a product, can also update the image to the field as explained below

    endpoint -/updateProduct/:productId  //replace productId with actual product id 
    type - PUT
    Content-Type is multipart/formData
    photo field in the form element should be "product-image"

    returns

    {
        updatedProdut: updatedProduct,
        formerProduct: foundProduct,
        message: "updated successfully",
    }



    ADDING TO CART - guest user can add to cart as well as main user, cookie is used to know who is adding to cart and 

    "credentials":"include" should be included in the fetch(url, {"credentials":"include"}) from the front end

    endpoint -/addToCart  
    type - POST
    Content-Type is application/json
    body - 
    {
        "productId":"the product id",
         "quantity":1
    } //quantity is 1 by default


    returns

    IF THE USER IS LOGGED IN i.e NOT A GUEST USER

        user has an existing product
    {
        cart: updatedCart, 
        message: "added quantity successfully" 
    }

        user doesnt have existing product. i.e add new product to cart
    {
        cart: updatedCart, 
        message: "product added successfully"
    }

    user doesnt have existing product. i.e add new product to a new cart
    {
        cart:newCart, 
        message:"main user cart created successfully"
    }


    IF THE USER IS NOT LOGGED IN i.e  A GUEST USER
        guest user adds to cart for the first time
    {
        cart: newCart,
        message: "guest cart created successfully",
    }
        subsequent adding to cart by guest

        ->same responses as IF THE USER IS LOGGED IN i.e NOT A GUEST USER
        above




    MAKING ORDER - user must be logged in

    endpoint -/makeOrder  
    type - POST
    no body. the endpoint grabs user Id and fulflls order by the user, so the user must be logged in

    returns

    {
        order: newOrder
    }



    DELETING A PRODUCT - deletor must be logged in

    endpoint -/deleteProduct/:productId   //replace productId with actual product id in the route
    type - DELETE
    no body. the endpoint grabs user Id and fulflls order by the user, so the user must be logged in

    returns

    {
        deletedProduct: deletedProduct,
        message: "deleted successfully",
    }




CART ENDPOINT - the admin views all carts the customers view thier cart and be able to remove products from cart
...........................................................
    admin only must be logged in to view cart, customers can be guest or regular users (customers);


    CUSTOMER VIEWING CART
    endpoint -/customersViewCart  
    type - GET
    NB: add "credentials":"include" in the fetch() from frontend

    returns

        if user is a guest
    {
        cart:foundCart, 
        totalPrice:totalPrice,  
        message:"fetched successfully"
    }

        if user is logged in
    {
        cart: user.cart.items,
        totalPrice:totalPrice,
        message: "users cart fetched successfully",
    }

        if user doesnt have cart yet
    {
        message:"empty cart, pls add product to view cart"
    }

    ADMIN VIEWING CART
    endpoint -/adminViewCart
    type - GET
    NB: must be an admin, be logged in to view all carts of the customer

    returns
    {
        carts: carts,
        message: ` ${carts.length} fetched successfully `,
    }

    CUSTOMERS REMOVING FROM CART
    endpoint -/removeProductFromCart/:productId //replace productId with actuall product id
    type - DELETE
    NB: user could be a gues or a registered user(customer)

    returns

    if guest,
    {
       message: "Removed from cart"
    }
    
    registered user,
    { 
        message: "Removed from cart" 
    }




ORDER ENDPOINT - the admin views all orders the customers can also view thier orders.
..............................................................
    users must be logged in 

    CUSTOMER VIEWING ORDERS
    endpoint -/customersViewOrders  
    type - GET
    NB: must be logged in to view his orders

    returns

    { 
        orders: orders, 
        message: "fetched successfully" 
    }


    ADMIN VIEWING ORDERS
    endpoint -/adminViewOrders
    type - GET
    NB: must be an admin, be logged in to view all carts of the customer

    returns
    { 
        orders: orders, 
        message: "fetched successfully" 
    }

    ADMIN UPDATING ORDERS
    endpoint -/updateOrderStatus
    type - POST
     Content-Type is application/json

     
    body - 
    {
        "status":"delivered", 
        "orderId":"the order id"
    }

    //status is either "delivered" or "pending"
    NB: must be an admin, be logged in to update orders
