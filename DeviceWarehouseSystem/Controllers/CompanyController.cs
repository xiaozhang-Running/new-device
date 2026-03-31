using Microsoft.AspNetCore.Mvc;
using DeviceWarehouseSystem.Models;
using Microsoft.EntityFrameworkCore;

namespace DeviceWarehouseSystem.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CompanyController : ControllerBase
    {
        private readonly DeviceWarehouseContext _context;

        public CompanyController(DeviceWarehouseContext context)
        {
            _context = context;
        }

        // GET: api/Company
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Company>>> GetCompanies()
        {
            if (_context.Companies == null)
            {
                return NotFound();
            }
            return await _context.Companies.ToListAsync();
        }

        // GET: api/Company/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Company>> GetCompany(int id)
        {
            if (_context.Companies == null)
            {
                return NotFound();
            }
            var company = await _context.Companies.FindAsync(id);

            if (company == null)
            {
                return NotFound();
            }

            return company;
        }

        // POST: api/Company
        [HttpPost]
        public async Task<ActionResult<Company>> PostCompany(Company company)
        {
            if (_context.Companies == null)
            {
                return Problem("Entity set 'DeviceWarehouseContext.Companies'  is null.");
            }
            _context.Companies.Add(company);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCompany", new { id = company.Id }, company);
        }

        // PUT: api/Company/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCompany(int id, Company company)
        {
            if (id != company.Id)
            {
                return BadRequest();
            }

            _context.Entry(company).State = EntityState.Modified;
            company.UpdatedAt = DateTime.Now;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!CompanyExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Company/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCompany(int id)
        {
            if (_context.Companies == null)
            {
                return NotFound();
            }
            var company = await _context.Companies.FindAsync(id);
            if (company == null)
            {
                return NotFound();
            }

            _context.Companies.Remove(company);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool CompanyExists(int id)
        {
            if (_context.Companies == null)
            {
                return false;
            }
            return _context.Companies.Any(e => e.Id == id);
        }
    }
}