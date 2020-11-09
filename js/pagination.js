 function Skip(pageNumber,nPerPage)
{
   return ( pageNumber - 1 ) * nPerPage
}
module.exports={Skip:Skip}